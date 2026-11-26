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
  version "1.15.0"
  license "Apache-2.0"

  on_macos do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.15.0/assemblash-v1.15.0-macos-aarch64.tar.gz"
      sha256 "3d098cf76f2b87403d3d89a687674c9a94cdc5d944e8fd7f2aba66c5671f26fe"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.15.0/assemblash-v1.15.0-macos-x86_64.tar.gz"
      sha256 "64e9545a31fcf9e71a843eb3310cdb787b6ed0f605c9e325f035964d180a2a6d"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.15.0/assemblash-v1.15.0-linux-aarch64.tar.gz"
      sha256 "f0b1d0bf5405f6d7fd0b69782ee97bbcb7af377ffe9823476816a16fbb5c5593"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.15.0/assemblash-v1.15.0-linux-x86_64.tar.gz"
      sha256 "05b179d5bfb49aafec24dfd5409a01b9557424edf4216195226cf280a7672c77"
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
