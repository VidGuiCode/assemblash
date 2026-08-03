//! The `assemblash` binary.
//!
//! Scaffolding only at this stage: it reports its version so the release
//! artifact can be verified. Document commands arrive with the Phase 0 spike.

fn main() {
    let mut args = std::env::args().skip(1);
    match args.next().as_deref() {
        Some("--version" | "-V") => println!("assemblash {}", env!("CARGO_PKG_VERSION")),
        _ => {
            println!("assemblash {}", env!("CARGO_PKG_VERSION"));
            println!("no commands yet — see https://github.com/VidGuiCode/assemblash");
        }
    }
}
