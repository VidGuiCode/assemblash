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
  version "1.2.0"
  license "Apache-2.0"

  on_macos do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.2.0/assemblash-v1.2.0-macos-aarch64.tar.gz"
      sha256 "b6301852698d2b1bc8ebe217254511dd49aad7aadc0daf59c7104885f4ace014"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.2.0/assemblash-v1.2.0-macos-x86_64.tar.gz"
      sha256 "b53b9b2a877f433ebe751d2721e380c0ef87cfd64cd7399eeab6d5b47bc60b20"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.2.0/assemblash-v1.2.0-linux-aarch64.tar.gz"
      sha256 "986110b87edd9b09eade0c8edcd0835b4df0d9f3265f90130d623b02800d5525"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.2.0/assemblash-v1.2.0-linux-x86_64.tar.gz"
      sha256 "c24cb668ea79f822d0d987016d834bd31c9c1a020f4ab20c2c624690f06617a0"
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
