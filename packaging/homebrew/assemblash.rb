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
      sha256 "c5120f1ff33285fe20d52b54c397ccdd81f43bcad13baf0c4b2094dd92cc83f0"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.2.0/assemblash-v1.2.0-macos-x86_64.tar.gz"
      sha256 "d959a8ba75e8e2ce222fb2646b48c50237acce2de2a7c45f6db68f9bad488c59"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.2.0/assemblash-v1.2.0-linux-aarch64.tar.gz"
      sha256 "fe9f5f02aeefc1f1af165ebb1b5afa277c65e416889ed2fa0d1c352929b66162"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.2.0/assemblash-v1.2.0-linux-x86_64.tar.gz"
      sha256 "11c79546932677750946f10e81de46c4efb6de6304db01914bf0a4fe32393b76"
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
