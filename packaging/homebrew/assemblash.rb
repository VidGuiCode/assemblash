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
  version "1.11.0"
  license "Apache-2.0"

  on_macos do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.11.0/assemblash-v1.11.0-macos-aarch64.tar.gz"
      sha256 "11b98589d7cf5bffaebbf7c3c6ecb063a1cc71492c4ceb5ec3cd24e0fa0201f5"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.11.0/assemblash-v1.11.0-macos-x86_64.tar.gz"
      sha256 "7cd60e8442f94ed7be91ed23e5bda30c2128ede63eeddd433630d0160a615eba"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.11.0/assemblash-v1.11.0-linux-aarch64.tar.gz"
      sha256 "8526e18d79c39f6afb8dc7366e785bddf63d6e66bd73f5254d0418c6a5aeb403"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.11.0/assemblash-v1.11.0-linux-x86_64.tar.gz"
      sha256 "34d6087f0a0f33f0f2a237f7a4e4e979f900cc9d18934ad1e2f2298e13632c9e"
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
