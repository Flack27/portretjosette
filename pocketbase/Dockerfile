# PocketBase — CMS, image store and auth for "Portret door Josette".
#
# PB_VERSION MUST match an existing release:
#   https://github.com/pocketbase/pocketbase/releases
# The schema migration (pb_migrations) was verified against 0.39.5. Bump this and
# rebuild when you upgrade PocketBase.
ARG PB_VERSION=0.39.5

FROM alpine:3.20 AS download
ARG PB_VERSION
ARG TARGETARCH=amd64
RUN apk add --no-cache ca-certificates unzip wget
WORKDIR /pb
RUN wget -q -O /tmp/pb.zip \
      "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_${TARGETARCH}.zip" \
 && unzip /tmp/pb.zip -d /pb \
 && rm /tmp/pb.zip

FROM alpine:3.20
RUN apk add --no-cache ca-certificates
WORKDIR /pb
COPY --from=download /pb/pocketbase /pb/pocketbase
# Version-controlled schema + hooks. pb_data is a mounted volume (see compose).
COPY pb_migrations /pb/pb_migrations
COPY pb_hooks /pb/pb_hooks
EXPOSE 8090
# Migrations in pb_migrations are applied automatically on start.
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090"]
