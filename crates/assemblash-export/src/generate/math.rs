//! Sine and cosine with the same bits on every target.
//!
//! `f64::sin` and `f64::cos` call the platform maths library. The six
//! release targets do not all use the same library, and the last bit of a
//! result can differ. A pie chart writes coordinates from these values, so
//! one bit can change an asset's sha256.
//!
//! These functions use only `+`, `-`, `*` and `/` on `f64`, which IEEE 754
//! defines exactly. Rust does not fuse a multiply and an add on its own, so
//! the result is the same on every target. The error is below 1e-15 on the
//! reduced range, far below the two decimals the SVG writer keeps.

use std::f64::consts::{FRAC_PI_2, FRAC_PI_4, PI};

const TAU: f64 = 2.0 * PI;

/// Sine of `x` radians.
pub fn sin(x: f64) -> f64 {
    let (quadrant, r) = reduce(x);
    match quadrant {
        0 => sin_kernel(r),
        1 => cos_kernel(r),
        2 => -sin_kernel(r),
        _ => -cos_kernel(r),
    }
}

/// Cosine of `x` radians.
pub fn cos(x: f64) -> f64 {
    let (quadrant, r) = reduce(x);
    match quadrant {
        0 => cos_kernel(r),
        1 => -sin_kernel(r),
        2 => -cos_kernel(r),
        _ => sin_kernel(r),
    }
}

/// `x = quadrant * π/2 + r`, with `r` in `[-π/4, π/4]`.
fn reduce(x: f64) -> (u8, f64) {
    if !x.is_finite() {
        return (0, f64::NAN);
    }
    // Into [-π, π] first. `round` and division are exact IEEE operations.
    let turns = (x / TAU).round();
    let mut r = x - turns * TAU;
    let mut quadrant = 0u8;
    // Then rotate by π/2 until r is in [-π/4, π/4]. At most two steps.
    while r > FRAC_PI_4 {
        r -= FRAC_PI_2;
        quadrant = (quadrant + 1) % 4;
    }
    while r < -FRAC_PI_4 {
        r += FRAC_PI_2;
        quadrant = (quadrant + 3) % 4;
    }
    (quadrant, r)
}

/// Taylor series of sine to the x^17 term, Horner form. On `[-π/4, π/4]` the
/// first omitted term is below 3e-19.
fn sin_kernel(x: f64) -> f64 {
    let x2 = x * x;
    let mut sum = 1.0 / 355_687_428_096_000.0; // 1/17!
    for denominator in [
        -1_307_674_368_000.0, // 15!
        6_227_020_800.0,      // 13!
        -39_916_800.0,        // 11!
        362_880.0,            // 9!
        -5_040.0,             // 7!
        120.0,                // 5!
        -6.0,                 // 3!
    ] {
        sum = sum * x2 + 1.0 / denominator;
    }
    x + x * x2 * sum
}

/// Taylor series of cosine to the x^18 term, Horner form.
fn cos_kernel(x: f64) -> f64 {
    let x2 = x * x;
    let mut sum = 1.0 / 6_402_373_705_728_000.0; // 1/18!
    for denominator in [
        -20_922_789_888_000.0, // 16!
        87_178_291_200.0,      // 14!
        -479_001_600.0,        // 12!
        3_628_800.0,           // 10!
        -40_320.0,             // 8!
        720.0,                 // 6!
        -24.0,                 // 4!
        2.0,                   // 2!
    ] {
        sum = sum * x2 + 1.0 / denominator;
    }
    1.0 - x2 * sum
}

#[cfg(test)]
#[allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]
mod tests {
    use super::*;

    #[test]
    fn agrees_with_the_platform_to_far_more_than_two_decimals() {
        let mut x = -20.0;
        while x < 20.0 {
            assert!((sin(x) - x.sin()).abs() < 1e-13, "sin {x}");
            assert!((cos(x) - x.cos()).abs() < 1e-13, "cos {x}");
            x += 0.001_7;
        }
    }

    #[test]
    fn exact_at_the_quadrant_points() {
        assert_eq!(sin(0.0), 0.0);
        assert_eq!(cos(0.0), 1.0);
        assert!((sin(FRAC_PI_2) - 1.0).abs() < 1e-15);
        assert!(cos(PI) + 1.0 < 1e-15);
    }
}
