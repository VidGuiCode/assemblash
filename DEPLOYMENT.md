# Self-hosting Assemblash

Assemblash is local-first. Run it on your machine. It needs no configuration,
no accounts, and no network. This page is about the other case: you serve it
to more than the machine it runs on.

## The rule

**The default is `127.0.0.1` with no token.** Anyone who can reach that socket
is already on the machine. There, the projects are ordinary readable files, so
there is nothing to gate.

**A bind to any other address refuses to start without an access token.** This
is not a warning. It is a refusal. A server that binds a network and continues
to serve publishes your workspace to that network. The flag would not look
like it was going to do that.

```sh
assemblash serve --bind 0.0.0.0
# error: refusing to bind 0.0.0.0: it is not a loopback address, and serving a
# network without an access token would publish this workspace to it.
# Run `assemblash token rotate` to create one, then start again
```

## Getting a token

```sh
assemblash token show     # prints it, creating one if there is none
assemblash token rotate   # replaces it; every existing client stops working
assemblash token clear    # removes it, so only a loopback bind will start
```

The token lives in the workspace's `config.toml` and nowhere else. There is
deliberately **no `--token` argument** anywhere. A secret on a command line is
a secret in your shell history and in every process listing on the machine.

## Using it

Every request carries the token as a bearer header:

```sh
curl -H "Authorization: Bearer $(assemblash token show)" \
     http://your-host:8787/api/projects
```

In a browser, open the server. It asks for the token once. The browser keeps
it in that tab (`sessionStorage`) and sends it as a header — **never in a
URL**. Then it cannot end up in browser history, in a `Referer`, or in a proxy
log.

A request without the token, or with a wrong token, gets a `401` in the same
typed error envelope as everything else:

```json
{ "error": { "code": "unauthorized",
             "message": "this server requires an access token: send it as `Authorization: Bearer <token>`",
             "details": {} } }
```

The comparison is constant time. The server never echoes back a rejected
token.

## Docker

The image binds `0.0.0.0` inside the container. A published port only reaches
a process bound to a routable address. The image therefore needs a token —
this is the safety property, not an obstacle:

```sh
docker compose run --rm assemblash token show
docker compose up
```

`compose.yaml` publishes on `127.0.0.1:8787` by default. Read the next
section. Then change it to `8787:8787` to reach the server from the network.

## TLS, and what the token is not

**The token authenticates. It does not encrypt.** It travels in a header.
Anyone who can read the traffic can read the token, and then use it.

For anything beyond a trusted network, put a reverse proxy in front, and let
the proxy terminate TLS. Assemblash speaks plain HTTP on purpose. Certificate
handling, renewal, and identity providers are large problems. Software that
does only this solves them well.

### Caddy

```caddyfile
assemblash.example.com {
    reverse_proxy assemblash:8787
}
```

Caddy obtains and renews a certificate itself. That is the whole file.

### Traefik

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.assemblash.rule=Host(`assemblash.example.com`)"
  - "traefik.http.routers.assemblash.tls.certresolver=letsencrypt"
  - "traefik.http.services.assemblash.loadbalancer.server.port=8787"
```

### nginx

```nginx
server {
    listen 443 ssl;
    server_name assemblash.example.com;

    # Exports and asset uploads are files; the default 1 MB body limit is
    # smaller than a photograph.
    client_max_body_size 64m;

    location / {
        proxy_pass http://127.0.0.1:8787;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Identity providers

Assemblash has no accounts and no built-in OIDC. If you need per-person
identity, single sign-on, or an audit trail tied to real users, put it in the
proxy. `oauth2-proxy`, Authelia, and Traefik's forward-auth all do this. Keep
the token as the proxy's own credential to the backend.

## A short checklist

- [ ] Run `assemblash token show`. Keep the token somewhere sensible.
- [ ] Bind explicitly: `--bind 0.0.0.0`, or `bind` in `config.toml`.
- [ ] Publish through a reverse proxy with TLS if the server is reachable
      beyond a network you trust.
- [ ] Run `assemblash token rotate` if the token is ever pasted somewhere it
      should not have been. Every client will need the new token. That is the
      point.
- [ ] Back up the workspace directory. It is plain files: `document.json`,
      `assets/`, `history/`. Nothing is hidden in a database.
