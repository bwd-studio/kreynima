# Licensing and dependency review

The original LICENSE is GNU GPL version 3. New package metadata uses GPL-3.0-only, conservatively avoiding an unverified grant of later-version licensing. Maintainers should confirm this interpretation before release. GPL permits commercial forks and sales with compliance obligations; trademark policy does not change code rights.

Use dependencies with documented provenance and compatible licenses. package-lock.json pins JavaScript resolutions. `npm run licenses` checks production dependency license metadata against an allowlist and fails on unknown/disallowed entries; it cannot establish legal compatibility on its own. Development dependencies also need review when redistributed. Rust dependencies are checked by cargo-deny. Review transitive licenses, source availability, notices, linking, platform SDK requirements, and distribution obligations before release. Preserve copyrights and licenses; provide corresponding source and build scripts with distributed GPL binaries.

Do not add FFmpeg binaries casually: enabled codecs and build flags can alter licensing obligations, and codec patents may require separate analysis. Optional Blender integration requires its own compatibility and distribution review. Do not imply affiliation with Blender, OpenAI, or Anthropic. External service terms do not grant rights to third-party artwork.

Legal review remains required for trademark rights, brand-asset classification, contribution terms, dependency notice completeness, and release distribution compliance. No registration, trademark clearance, patent clearance, or legal approval is asserted.
