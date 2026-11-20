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
  version "1.14.0"
  license "Apache-2.0"

  on_macos do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.14.0/assemblash-v1.14.0-macos-aarch64.tar.gz"
      sha256 "27333dc1d8c66725a197f7671521e91aeeac3c037556956e83eb9536149aade8"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.14.0/assemblash-v1.14.0-macos-x86_64.tar.gz"
      sha256 "6e408b2dcc2738b3f5610dcdb5b629b6042c43957a385ee101bf313a2350b44f"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.14.0/assemblash-v1.14.0-linux-aarch64.tar.gz"
      sha256 "b573bacdf72ce0498fbb9f3b5ec2ac13829961082dc158a0a48d5ca112f6377f"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.14.0/assemblash-v1.14.0-linux-x86_64.tar.gz"
      sha256 "981c6d8312a045ffeb0a681ef2b85d87f1ffd63cab66c1c4d067158109a0d1a9"
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
