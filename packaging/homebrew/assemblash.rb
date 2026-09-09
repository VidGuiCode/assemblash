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
  version "1.5.0"
  license "Apache-2.0"

  on_macos do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.5.0/assemblash-v1.5.0-macos-aarch64.tar.gz"
      sha256 "6b11a853f54e3ec31e802a50f6ccc5edeaff0651e4e722887953507bbc0d42b6"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.5.0/assemblash-v1.5.0-macos-x86_64.tar.gz"
      sha256 "ab97a5e68e1c60cc525f48c42d6ef9e842ea5d3a7445a45aa2542c0a7a54156e"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.5.0/assemblash-v1.5.0-linux-aarch64.tar.gz"
      sha256 "8d6f90ed164fbe0d41c585c40c0a53d7478607ba3d74825c670971218b72b0ed"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.5.0/assemblash-v1.5.0-linux-x86_64.tar.gz"
      sha256 "9af5c45f59308ae10be12d48063ed69f7120e866d01290669bc6f5e2d8fe6f0a"
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
