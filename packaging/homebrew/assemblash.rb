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
  version "1.7.0"
  license "Apache-2.0"

  on_macos do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.7.0/assemblash-v1.7.0-macos-aarch64.tar.gz"
      sha256 "12d56c1dc9052cc61e3e21caa4ecea198b5ea57d4591309bcd14ff7e6656c168"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.7.0/assemblash-v1.7.0-macos-x86_64.tar.gz"
      sha256 "eb43aa2c2f2f09dc8c3d62b1b45e137cf2393fa9fc94f80942aa4b96f6081b59"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.7.0/assemblash-v1.7.0-linux-aarch64.tar.gz"
      sha256 "8df1f3bd11783539f5fbd33e85ef5e839b2123d00843f788b7a69cfc490bf7a1"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.7.0/assemblash-v1.7.0-linux-x86_64.tar.gz"
      sha256 "c3d6e00424b58e4af14ddb4141aa2c3cdf607bd161afc56fc64ca2aa13e4eb68"
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
