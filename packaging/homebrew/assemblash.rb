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
  version "1.7.1"
  license "Apache-2.0"

  on_macos do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.7.1/assemblash-v1.7.1-macos-aarch64.tar.gz"
      sha256 "1da87d19e1a0158c4a20d85d1b0622b1d490f4f803a37dc893dab9d114a950f3"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.7.1/assemblash-v1.7.1-macos-x86_64.tar.gz"
      sha256 "dcb706dfdbbacd2e273b6a1d57fa5b9403f569322c5c5eefedbfcf8d8e848967"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.7.1/assemblash-v1.7.1-linux-aarch64.tar.gz"
      sha256 "8f13437722bfaaca4e7dea229eebba9f3547e6b5b47a410cf17afafbf4a8d932"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.7.1/assemblash-v1.7.1-linux-x86_64.tar.gz"
      sha256 "ba72a90c021e55ce4fa30135483a6320e671fa02b6f49b7f25125bbf46856323"
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
