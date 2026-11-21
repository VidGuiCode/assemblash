//! A small RFC 4180 CSV reader, so chart and table data needs no
//! dependency.
//!
//! Fields are separated by commas. A field in double quotes may hold
//! commas, line breaks and doubled quotes (`""` for one `"`). Lines end with
//! LF or CRLF. A UTF-8 byte order mark at the start is ignored. Empty lines
//! are skipped.

use super::GenerateError;

/// The largest CSV this reader accepts, in bytes.
pub(crate) const MAX_CSV_BYTES: usize = 1024 * 1024;

/// Reads CSV text into rows of fields.
pub fn parse_csv(text: &str) -> Result<Vec<Vec<String>>, GenerateError> {
    if text.len() > MAX_CSV_BYTES {
        return Err(GenerateError::InvalidCsv {
            line: 1,
            reason: format!("the file is larger than {MAX_CSV_BYTES} bytes"),
        });
    }
    let text = text.strip_prefix('\u{feff}').unwrap_or(text);
    let mut rows = Vec::new();
    let mut row: Vec<String> = Vec::new();
    let mut field = String::new();
    let mut line = 1;
    let mut quote_line = 0;
    let mut in_quotes = false;
    let mut field_started = false;
    let mut chars = text.chars().peekable();

    while let Some(c) = chars.next() {
        if in_quotes {
            match c {
                '"' if chars.peek() == Some(&'"') => {
                    chars.next();
                    field.push('"');
                }
                '"' => {
                    in_quotes = false;
                    // Only a separator or a line end may follow a closing quote.
                    match chars.peek() {
                        None | Some(',') | Some('\n') | Some('\r') => {}
                        Some(other) => {
                            return Err(GenerateError::InvalidCsv {
                                line,
                                reason: format!("{other:?} after a closing quote"),
                            })
                        }
                    }
                }
                '\n' => {
                    line += 1;
                    field.push('\n');
                }
                c => field.push(c),
            }
            continue;
        }
        match c {
            '"' if !field_started => {
                in_quotes = true;
                field_started = true;
                quote_line = line;
            }
            '"' => {
                return Err(GenerateError::InvalidCsv {
                    line,
                    reason: "a quote inside an unquoted field".to_owned(),
                })
            }
            ',' => {
                row.push(std::mem::take(&mut field));
                field_started = false;
            }
            '\r' if chars.peek() == Some(&'\n') => {}
            '\n' | '\r' => {
                end_row(&mut rows, &mut row, &mut field);
                field_started = false;
                line += 1;
            }
            c => {
                field.push(c);
                field_started = true;
            }
        }
    }
    if in_quotes {
        return Err(GenerateError::InvalidCsv {
            line: quote_line,
            reason: "a quoted field is not closed".to_owned(),
        });
    }
    end_row(&mut rows, &mut row, &mut field);
    Ok(rows)
}

fn end_row(rows: &mut Vec<Vec<String>>, row: &mut Vec<String>, field: &mut String) {
    row.push(std::mem::take(field));
    let row = std::mem::take(row);
    // An empty line is one empty field.
    if !(row.len() == 1 && row[0].is_empty()) {
        rows.push(row);
    }
}

#[cfg(test)]
#[allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]
mod tests {
    use super::*;

    #[test]
    fn reads_quotes_doubled_quotes_and_line_ends() {
        let rows =
            parse_csv("\u{feff}a,b\r\n\"x, y\",\"say \"\"hi\"\"\"\n\n\"two\nlines\",3").unwrap();
        assert_eq!(
            rows,
            vec![
                vec!["a".to_owned(), "b".to_owned()],
                vec!["x, y".to_owned(), "say \"hi\"".to_owned()],
                vec!["two\nlines".to_owned(), "3".to_owned()],
            ]
        );
    }

    #[test]
    fn refuses_broken_quoting_with_the_line() {
        assert_eq!(
            parse_csv("a\n\"open").unwrap_err(),
            GenerateError::InvalidCsv {
                line: 2,
                reason: "a quoted field is not closed".to_owned()
            }
        );
        assert!(parse_csv("a\"b").is_err());
        assert!(parse_csv("\"a\"b").is_err());
    }

    #[test]
    fn keeps_empty_fields() {
        assert_eq!(parse_csv("a,,c").unwrap(), vec![vec!["a", "", "c"]]);
    }
}
