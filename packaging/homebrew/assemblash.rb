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
  version "1.13.1"
  license "Apache-2.0"

  on_macos do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.13.1/assemblash-v1.13.1-macos-aarch64.tar.gz"
      sha256 "743947e3e52ab7eeae35df6439071933289428f95916d667a4036f0b26a7a670"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.13.1/assemblash-v1.13.1-macos-x86_64.tar.gz"
      sha256 "f0371bdd7591a82a902f463bb75544c3cfa776072577032ece392b7dbac60dec"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.13.1/assemblash-v1.13.1-linux-aarch64.tar.gz"
      sha256 "d5c1dd7f4be87280af551fc7fe35d609a796cdfd490e47f7a8790c4587d28784"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.13.1/assemblash-v1.13.1-linux-x86_64.tar.gz"
      sha256 "095c92345b7e439dd28795daa735debe022b6cb269e5174aca4a07cfe1d6c61b"
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
