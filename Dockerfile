# Assemblash in a container.
#
# The final image is `scratch` plus one statically linked binary. There is no
# shell, no package manager, and no libc — nothing to patch and nothing to
# exploit, which is the point of a deployment story that is "one static
# binary" rather than "a binary and its dependencies".
#
#   docker build -t assemblash .
#   docker run --rm -p 8787:8787 -v assemblash:/data assemblash token show
#   docker run --rm -p 8787:8787 -v assemblash:/data assemblash
#
# The first command prints the workspace's access token — the image binds
# 0.0.0.0 so the published port reaches it, and a non-loopback bind refuses to
# start without one. Open http://127.0.0.1:8787 and paste the token once.
#
# The token authenticates; it does not encrypt. Put a reverse proxy with TLS in
# front of anything reachable beyond a trusted network — see DEPLOYMENT.md.

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

# A published port only reaches a process bound to a routable address inside
# the container, so the image binds 0.0.0.0 — which the server refuses to do
# without an access token. That refusal is the feature: the image cannot be
# run wide open by forgetting something.
ENV ASSEMBLASH_BIND=0.0.0.0
EXPOSE 8787

ENTRYPOINT ["/assemblash"]
CMD ["serve", "--bind", "0.0.0.0"]
