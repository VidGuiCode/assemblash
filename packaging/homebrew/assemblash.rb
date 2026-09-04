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
  version "1.3.0"
  license "Apache-2.0"

  on_macos do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.3.0/assemblash-v1.3.0-macos-aarch64.tar.gz"
      sha256 "2ac485f626e60bb122dbbb85fa009b075ab851dfb44c3287ebfd3f55887ae9e2"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.3.0/assemblash-v1.3.0-macos-x86_64.tar.gz"
      sha256 "c0d5adece6b18e07732562da12a34ea1ab4c59de6fcd7d130ba429ac077758b2"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.3.0/assemblash-v1.3.0-linux-aarch64.tar.gz"
      sha256 "78719091acc042f6bf9f9efb83da7ebf593c2c1cd0fd028b67b51642ca8e84c2"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.3.0/assemblash-v1.3.0-linux-x86_64.tar.gz"
      sha256 "031d3159a7f7dbee03ce72d47cf1e36d0c3ca7fc15befad36c6b586d43eedf53"
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
