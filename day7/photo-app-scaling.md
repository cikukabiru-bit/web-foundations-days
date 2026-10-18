# SnapShare Scaling Plan

SnapShare is a photo-sharing app. Users upload photos and scroll a feed of photos from the people they follow.

## 1. Assumptions

- 10 million registered users.
- 10% of users are active each day.
- Each active user uploads 1 photo per day.
- Each active user views 50 feed pages per day.
- An average photo is 2 MB, and each photo also gets a 50 KB thumbnail.
- Peak traffic is 5 times the average.
- There are 86,400 seconds in a day.
- For storage, 1 TB = 1,000,000 MB and 1 MB = 1,000 KB.

_Daily active users (DAU)_ = 10,000,000 × 10% = **1,000,000 users per day**

## 2. Estimates

### Uploads per second

- Uploads per day = 1,000,000 users × 1 photo = 1,000,000 uploads
- Average = 1,000,000 ÷ 86,400 ≈ 11.6, so about **12 uploads per second**
- Peak = 11.6 × 5 ≈ **58 uploads per second**

### Feed views per second

- Feed views per day = 1,000,000 users × 50 pages = 50,000,000 views
- Average = 50,000,000 ÷ 86,400 ≈ 578.7, so about **579 feed views per second**
- Peak = 578.7 × 5 ≈ **2,894 feed views per second** (about 2,900)

### Storage per year

- Photos per day = 1,000,000 × 2 MB = 2,000,000 MB = 2 TB
- Thumbnails per day = 1,000,000 × 50 KB = 50,000,000 KB = 50 GB
- Total per day = 2 TB + 0.05 TB = **2.05 TB**
- Total per year = 2.05 TB × 365 ≈ **748 TB per year** (about 0.75 PB)

## 3. Read-heavy or write-heavy?

SnapShare is read-heavy. Each active user views 50 feed pages but uploads only 1 photo, so there are about 50 reads for every write (579 feed views per second against 12 uploads per second). Each feed page also loads several photos, so the real number of image reads is even higher.

- Serve photos from a **CDN** so most image requests never reach our servers.
- **Cache** feeds and popular data so the database is not asked the same question again and again.
- Add a **read replica** so feed reads are spread across more than one database.
- Writes (uploads) are fewer, so one primary database can handle them. The slow part of a write (making the thumbnail) is moved to a **queue** so the upload itself stays fast.

## 4. Why photos are not stored in the database

Photos should **not** be stored inside the database:

- At 748 TB per year, the database would become huge, slow and very expensive.
- Backups and copies to the read replica would take far longer.
- Every image download would use the database, which should be kept for fast, small queries.

Instead, photo files go into **object storage** (for example Amazon S3 or Google Cloud Storage), which is built to store huge numbers of large files cheaply and safely. The database stores only the **metadata** for each photo: its id, owner, caption, upload time and the storage keys (addresses) of the photo and its thumbnail. The CDN then delivers the files from object storage to users.

## 5. Architecture diagram

```text
                  Users (mobile app / web browser)
                     |                        |
      downloads photos & thumbnails           | API requests
                     |                        | (upload, feed, follow)
                     v                        v
              +-------------+         +---------------+
              |     CDN     |         | Load Balancer |
              +-------------+         +---------------+
                     |                   |         |
      fetches files  |                   v         v
      on a cache miss|           +------------+ +------------+
                     |           | App Server | | App Server |
                     |           |     1      | |     2      |
                     |           +------------+ +------------+
                     |                   |         |
                     |      +------------+----+----+-----------+----------------+
                     |      |                 |                |                |
                     |      v                 v                v                v
                     |  +---------+   +---------------+   +---------+   +----------------+
                     |  |  Cache  |   |  Primary DB   |   |  Queue  |   | Object Storage |
                     |  | (feeds) |   |   (writes)    |   | (jobs)  |   | (photo files)  |
                     |  +---------+   +---------------+   +---------+   +----------------+
                     |                        |                |                ^    ^
                     |                        | copies data    v                |    |
                     |                        v           +-----------+  saves  |    |
                     |                +---------------+   | Thumbnail |---------+    |
                     |                | Read Replica  |   |  Worker   | thumbnails   |
                     |                | (feed reads)  |   +-----------+              |
                     |                +---------------+                              |
                     |                                                               |
                     +---------------------------------------------------------------+
```

Notes on the diagram:

- App servers read feeds from the **cache** first, and from the **read replica** when the cache does not have them.
- App servers send all writes (new photos, follows) to the **primary database**.
- App servers save original photos to **object storage**; the CDN fetches files from object storage the first time they are requested.

## 6. Components and the problem each one solves

- **CDN:** stores copies of photos and thumbnails in locations close to users, so images load quickly and most image traffic never reaches our servers.
- **Load balancer:** spreads incoming requests across the app servers, so no single server is overloaded and the app keeps working if one server fails.
- **App servers:** run the SnapShare code (log in, upload, build feeds), and because there are several of them we can add more as traffic grows.
- **Cache:** keeps recently built feeds and popular photo details in memory, so repeated feed requests are answered in milliseconds without hitting the database.
- **Primary database:** stores users, follows and photo metadata, and handles all the writes, so there is one trusted source of truth.
- **Read replica:** keeps a copy of the primary database and answers read queries, so the heavy feed traffic does not slow down writes.
- **Object storage:** stores the actual photo and thumbnail files cheaply and safely, so the database stays small and fast.
- **Queue:** holds "make a thumbnail" jobs, so the upload request can finish immediately instead of waiting for slow image processing.
- **Thumbnail worker:** takes jobs from the queue and creates the 50 KB thumbnails in the background, and more workers can be added if the queue gets long.

## 7. Upload flow (step by step)

1. The user chooses a photo and taps **Upload**. The app sends a `POST /photos` request with the photo and caption over HTTPS.
2. The **load balancer** sends the request to one of the **app servers**.
3. The app server checks the user is logged in and that the file is a valid image and not too large.
4. The app server saves the original photo in **object storage** and gets back its storage key.
5. The app server saves the photo's metadata in the **primary database** (photo id, user id, caption, time, storage key, and thumbnail status "pending").
6. The app server puts a **"make thumbnail" message** on the **queue** containing the photo id and storage key.
7. The app server replies **201 Created** to the user straight away. The user does not wait for the thumbnail.
8. The **thumbnail worker** takes the message from the queue, downloads the original from object storage, creates the 50 KB thumbnail and saves it to object storage.
9. The worker updates the photo's row in the primary database with the thumbnail key and sets the status to "ready". The change is copied to the **read replica**.
10. The cached feeds of the uploader's followers are refreshed (or expire), so the new photo appears in their feeds.
11. When followers scroll their feed, the app server reads the feed from the **cache** or **read replica**, and the photo and thumbnail files are downloaded from the **CDN**, which fetches them from object storage the first time.

## 8. Trade-offs

1. **Caching feeds: speed vs freshness.** Cached feeds are much faster and protect the database, but a feed may be slightly out of date. A new photo might take up to a minute to appear for followers. We accept this because a short delay in a photo feed is not harmful.
2. **Read replica: more read capacity vs replication lag.** The replica takes the heavy read load, but it can be a moment behind the primary. A user might not see their own new photo right after uploading. To fix this, a user's own recent uploads can be read from the primary database.
3. **Queue for thumbnails: fast uploads vs extra complexity.** Uploads finish quickly, but the thumbnail appears a few seconds later, and we have one more system (the queue and worker) to run and monitor. If the worker fails, the job stays in the queue and is retried, so no thumbnail is lost.
4. **CDN and object storage: performance vs cost.** Storing about 748 TB a year and delivering it through a CDN costs money, but it is far cheaper and faster than serving images from our own servers and database.
