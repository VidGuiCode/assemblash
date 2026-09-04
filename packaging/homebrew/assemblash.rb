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
  version "1.2.1"
  license "Apache-2.0"

  on_macos do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.2.1/assemblash-v1.2.1-macos-aarch64.tar.gz"
      sha256 "7f24dbbc24414b1439e49c63d14271c715a7ae13fabf55a1292c2fe6d23db64a"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.2.1/assemblash-v1.2.1-macos-x86_64.tar.gz"
      sha256 "837f62012533f0c858648c175b7eb93464b48076b2f28cf7579086208bc216f7"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.2.1/assemblash-v1.2.1-linux-aarch64.tar.gz"
      sha256 "93f6d50864f72b5b58bb38f7a55d8f3d07bf29bd311cdf8324276d1bf0a86a17"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.2.1/assemblash-v1.2.1-linux-x86_64.tar.gz"
      sha256 "6c75b8d36cefa64d47dfb817f7951aa89f93c2e0efca2360e9cd2818e07b5d8e"
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
