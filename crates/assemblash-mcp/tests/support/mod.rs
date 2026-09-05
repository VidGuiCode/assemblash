//! Shared support for the tests that drive the real `assemblash` binary.
//!
//! Every integration test in this crate spawns the executable as a child
//! process rather than reaching into the library. That is the point of them:
//! they are the only tests here that exercise what is actually shipped, over a
//! real stdio pipe, with a client that is a different implementation from the
//! server half under test.

#![allow(unreachable_pub)]

use std::path::PathBuf;
use std::process::Command;
use std::sync::OnceLock;

/// The binary under test, freshly resolved from Cargo's build output.
///
/// `CARGO_BIN_EXE_` is set only for the crate that declares a binary, and
/// `assemblash` is declared by `assemblash-cli`. Asking Cargo for the artifact
/// path avoids guessing from this test executable's target/profile directory
/// and cannot silently select a stale binary left by an earlier build.
pub fn binary() -> PathBuf {
    static BUILT: OnceLock<PathBuf> = OnceLock::new();

    let mut test_directory = std::env::current_exe().expect("the test binary has a path");
    test_directory.pop(); // deps/
    test_directory.pop(); // <profile>/
    let profile = test_directory
        .file_name()
        .and_then(|name| name.to_str())
        .expect("the profile directory is named")
        .to_owned();

    BUILT.get_or_init(|| build(&profile)).clone()
}

/// Build `assemblash` with the test's profile and return Cargo's artifact path.
fn build(profile: &str) -> PathBuf {
    // Cargo sets `CARGO` for every process it runs, so this is the same
    // toolchain that is driving the test. The literal is the fallback for
    // anyone running the test binary by hand.
    let cargo = std::env::var_os("CARGO").unwrap_or_else(|| "cargo".into());
    let mut command = Command::new(cargo);
    command
        .args(["build", "--message-format=json"])
        .args(["--package", "assemblash-cli"])
        .args(["--bin", "assemblash"])
        // Pointing at this crate's own manifest keeps target directory,
        // config and profile resolution cargo's usual ones.
        .args([
            "--manifest-path",
            concat!(env!("CARGO_MANIFEST_DIR"), "/Cargo.toml"),
        ]);
    // The dev profile builds into `debug/`, which is why the directory name is
    // not simply the profile name.
    match profile {
        "debug" => {}
        "release" => {
            command.arg("--release");
        }
        other => {
            command.args(["--profile", other]);
        }
    }

    let output = command
        .output()
        .expect("cargo runs — it is what started this test");
    assert!(
        output.status.success(),
        "building the assemblash binary for the `{profile}` profile failed:\n{}",
        String::from_utf8_lossy(&output.stderr)
    );
    artifact_from_messages(&String::from_utf8_lossy(&output.stdout))
        .filter(|path| path.is_file())
        .unwrap_or_else(|| {
            panic!("cargo did not report an assemblash executable for the `{profile}` profile")
        })
}

fn artifact_from_messages(messages: &str) -> Option<PathBuf> {
    messages
        .lines()
        .filter_map(|line| serde_json::from_str::<serde_json::Value>(line).ok())
        .find_map(|message| {
            let target = message.get("target")?;
            let is_binary = target.get("name")?.as_str()? == "assemblash"
                && target
                    .get("kind")?
                    .as_array()?
                    .iter()
                    .any(|kind| kind.as_str() == Some("bin"));
            is_binary
                .then(|| message.get("executable")?.as_str().map(PathBuf::from))
                .flatten()
        })
}

#[test]
fn cargo_artifact_messages_select_the_shipped_binary() {
    let messages = [
        serde_json::json!({
            "reason": "compiler-artifact",
            "target": { "name": "assemblash_core", "kind": ["lib"] },
            "executable": null
        })
        .to_string(),
        serde_json::json!({
            "reason": "compiler-artifact",
            "target": { "name": "assemblash", "kind": ["bin"] },
            "executable": "target/custom-profile/assemblash-test-bin"
        })
        .to_string(),
    ]
    .join("\n");

    assert_eq!(
        artifact_from_messages(&messages),
        Some(PathBuf::from("target/custom-profile/assemblash-test-bin"))
    );
}
