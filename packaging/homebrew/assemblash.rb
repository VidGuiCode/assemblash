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
  version "1.3.1"
  license "Apache-2.0"

  on_macos do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.3.1/assemblash-v1.3.1-macos-aarch64.tar.gz"
      sha256 "13b5e0fe7d87e216c8c9f918db0663887dbb3b29a4c58c91c633f0b254a0bb6c"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.3.1/assemblash-v1.3.1-macos-x86_64.tar.gz"
      sha256 "1b33c5b51fa7acd8b56b8a123e7620a27c8230d7dd64c1fe7bc8541d6d41d43c"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.3.1/assemblash-v1.3.1-linux-aarch64.tar.gz"
      sha256 "e49f0a2ed39086af17d1bc6dae61743809ce73a56c41f71bd9d57ca214d59750"
    end
    on_intel do
      url "https://github.com/VidGuiCode/assemblash/releases/download/v1.3.1/assemblash-v1.3.1-linux-x86_64.tar.gz"
      sha256 "ecef42923992409ee0bf2a4ad9fc4b683ac241cc24ae3f696e8be35e24048704"
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
