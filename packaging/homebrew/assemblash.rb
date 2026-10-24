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
  version "1.13.0"
  license "Apache-2.0"

  on_macos do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.13.0/assemblash-v1.13.0-macos-aarch64.tar.gz"
      sha256 "7ad7a5a385c9f38e006126950a36b5abd0149ba22953317d12a13f0898c3a376"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.13.0/assemblash-v1.13.0-macos-x86_64.tar.gz"
      sha256 "3884b15ac24aa29bcbd0bfa211054af121cfb10f8f5956492362447ab76ddbe5"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.13.0/assemblash-v1.13.0-linux-aarch64.tar.gz"
      sha256 "84bbd485569c17e7bcc16a1c445ad0d13a60549a44f5ff6faa71d345a6eaa3af"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.13.0/assemblash-v1.13.0-linux-x86_64.tar.gz"
      sha256 "af5be7abdc00eb292d7ba98f82fdc3480f0016f0c8f9c1ac6f0de8cd8d070e5a"
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
