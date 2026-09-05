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
  version "1.4.0"
  license "Apache-2.0"

  on_macos do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.4.0/assemblash-v1.4.0-macos-aarch64.tar.gz"
      sha256 "d065bef83c195e17b7a1aae92a2e4f6bb03efef2df6a82d1ddef5558592a4f2b"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.4.0/assemblash-v1.4.0-macos-x86_64.tar.gz"
      sha256 "871484f8c7b3c030f1facaf0d2ca99bf7fca2530eaa644a225d3f071c5619917"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.4.0/assemblash-v1.4.0-linux-aarch64.tar.gz"
      sha256 "174e90fae2797ab578cf3b93d10175271636dc6bef488b83e0859f37a8b87ed5"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.4.0/assemblash-v1.4.0-linux-x86_64.tar.gz"
      sha256 "7da12c9d6d2908699a959f0750a03fdcd415a7cdbe6a44d3c77d5c3138961940"
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
