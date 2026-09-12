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
  version "1.8.0"
  license "Apache-2.0"

  on_macos do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.8.0/assemblash-v1.8.0-macos-aarch64.tar.gz"
      sha256 "2a758a5c48947bc450195422e19cc4dfd4081f5a9920a0db06c7316c173cad94"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.8.0/assemblash-v1.8.0-macos-x86_64.tar.gz"
      sha256 "2e68d7ba6b6c1e9669c08597f949b6a9f1f44af699fccc1ab629cd53904abd26"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.8.0/assemblash-v1.8.0-linux-aarch64.tar.gz"
      sha256 "9ac329008e933b843b03ced2e688e9d9e8288d5fda6e64ed880b935634fce758"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.8.0/assemblash-v1.8.0-linux-x86_64.tar.gz"
      sha256 "052227ac416f7669f11a0ffb96b37d9013823e8aad73cc0d389dee410c91cb23"
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
