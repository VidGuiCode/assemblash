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
  version "1.10.0"
  license "Apache-2.0"

  on_macos do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.10.0/assemblash-v1.10.0-macos-aarch64.tar.gz"
      sha256 "90aae0747705170060bfcb700528b65f6f2305f3832cce7c20eb5805129b91aa"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.10.0/assemblash-v1.10.0-macos-x86_64.tar.gz"
      sha256 "02555a86d3c62694c8e6095a6b423857d319687f544aeca8eeb4648ba382831b"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.10.0/assemblash-v1.10.0-linux-aarch64.tar.gz"
      sha256 "0f1b3f47beeff905be8997334fa81b62fe63f99c37c7c098dba3a410be0231b2"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.10.0/assemblash-v1.10.0-linux-x86_64.tar.gz"
      sha256 "41342c1007ca9e5c16aeabeb21a88350058d8068d1e04c539d09f52897024dc1"
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
