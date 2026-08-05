# Assemblash in a container.
#
# The final image is `scratch` plus one statically linked binary. There is no
# shell, no package manager, and no libc — nothing to patch and nothing to
# exploit, which is the point of a deployment story that is "one static
# binary" rather than "a binary and its dependencies".
#
#   docker build -t assemblash .
#   docker run --rm -p 8787:8787 -v assemblash:/data assemblash
#
# Then open http://127.0.0.1:8787.

FROM rust:1.92-alpine AS build

# musl-dev for the static C runtime the target links against; the rest of the
# graph is pure Rust.
RUN apk add --no-cache musl-dev

WORKDIR /src
COPY . .

# ui/dist is committed, so the interface is built into the binary without Node
# ever entering this image.
RUN cargo build --release --locked --package assemblash-cli \
    --target x86_64-unknown-linux-musl \
 && strip target/x86_64-unknown-linux-musl/release/assemblash

FROM scratch

COPY --from=build /src/target/x86_64-unknown-linux-musl/release/assemblash /assemblash
COPY --from=build /src/LICENSE /src/NOTICE /src/DEPENDENCIES.md /

# The workspace lives on a volume, so projects and fonts survive the container.
ENV ASSEMBLASH_WORKSPACE=/data
VOLUME ["/data"]

# Loopback-only is the server's own rule, so reaching it from outside the
# container needs the port published *and* the address bound inside — which
# this release does not offer. `docker run -p` therefore reaches it only via
# the container's own loopback; for now this image is for `docker run` with
# `--network host`, or for the CLI and MCP surfaces.
EXPOSE 8787

ENTRYPOINT ["/assemblash"]
CMD ["serve"]
