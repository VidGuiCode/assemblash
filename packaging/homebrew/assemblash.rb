# Homebrew formula for Assemblash.
#
# STATUS: this formula has not been run on a Mac. It is published so that
# macOS users have a path that is expected to work around Gatekeeper, and
# so that anyone who does run it can report back. Treat it as unverified.
#
# This file is the source of truth. To publish it, copy it to
# `Formula/assemblash.rb` in the tap repository `VidGuiCode/homebrew-tap`,
# which is what makes `brew install VidGuiCode/tap/assemblash` resolve.
#
# Why a tap rather than a .dmg: the released binaries are not signed with an
# Apple Developer ID, so a downloaded .dmg or .tar.gz is quarantined and
# Gatekeeper refuses to open it. Homebrew clears the quarantine attribute on
# what it installs, so this is the macOS path that works without a paid
# developer account.
#
# On a new release, bump `version` and replace the four checksums with the
# matching lines from that release's SHA256SUMS asset.
class Assemblash < Formula
  desc "Structured document engine with a local browser-based editor"
  homepage "https://github.com/VidGuiCode/assemblash"
  version "1.6.0"
  license "Apache-2.0"

  on_macos do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.6.0/assemblash-v1.6.0-macos-aarch64.tar.gz"
      sha256 "777cb853109edae4777cfc42402c96bca17fdb0f51410ac496541f25e9eb012f"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.6.0/assemblash-v1.6.0-macos-x86_64.tar.gz"
      sha256 "dd071507bccbe4729d05ddd19b72d8486efb3f1d3adfd81a2b659f83fb60ce85"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.6.0/assemblash-v1.6.0-linux-aarch64.tar.gz"
      sha256 "c035a6aabc3508afc43079f140bb42c3bb0f16792899889b28eb361ec849d9db"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.6.0/assemblash-v1.6.0-linux-x86_64.tar.gz"
      sha256 "6719b23fcb758a5bc0def2557a6180cd1470ae3db01af926d708ac95e16c59c6"
    end
  end

  def install
    bin.install "assemblash"
    # The archive carries the licence texts the static binary is built from;
    # they travel with the install rather than being dropped on the floor.
    doc.install "README.md", "CHANGELOG.md", "LICENSE", "NOTICE", "THIRD_PARTY_LICENSES.md"
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/assemblash --version")
  end
end
