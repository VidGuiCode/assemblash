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
  version "1.6.1"
  license "Apache-2.0"

  on_macos do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.6.1/assemblash-v1.6.1-macos-aarch64.tar.gz"
      sha256 "2bd6d4b1d4f4f578c282197c323af6a3a93a7d4631d8bb43481917b22bd06a4c"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.6.1/assemblash-v1.6.1-macos-x86_64.tar.gz"
      sha256 "56c2f43fceb56ff3499a509d11cc266f7af1ce1b5006eab595208af21e4c9c57"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.6.1/assemblash-v1.6.1-linux-aarch64.tar.gz"
      sha256 "50a5c0ea8215f59700677ae774642c1c9b7f021bb05e7b37a5876f5ed392f650"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.6.1/assemblash-v1.6.1-linux-x86_64.tar.gz"
      sha256 "84823dfad4be935657ca5827f540662472c662906e6a7d2f2f49229b1ca6565b"
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
