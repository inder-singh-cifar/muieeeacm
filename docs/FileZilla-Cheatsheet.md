# FileZilla Definitions Cheat Sheet
### Essential Terms for File Transfer and Web Hosting
**IEEE/ACM AI Workshops | Monmouth University**

---

## Monmouth University Connection Details

| Field | Value |
|-------|-------|
| **Host** | `zorak.monmouth.edu` |
| **Username** | Your "s" + 7-digit student ID (e.g., `s1234567`) |
| **Password** | Your chosen password (set it yourself - remember it!) |
| **Port** | `21` |

> **Note:** All Monmouth email holders (@monmouth.edu) can use these credentials. Make sure to set your FTP password through the university system first!

---

## FileZilla Interface Basics

| Term | Definition |
|------|------------|
| **Host** | The server address you're connecting to. Usually your web hosting provider's server name (e.g., ftp.yoursite.com) or an IP address. |
| **Username** | Your FTP account username provided by your hosting service. Identifies who is connecting. |
| **Password** | The secret code paired with your username to authenticate your connection. Keep it secure! |
| **Port** | A number specifying which "door" to use. FTP uses port 21, SFTP uses port 22. Leave blank for default. |
| **Local Site (Left Panel)** | Shows files on YOUR computer. Navigate here to find files to upload. |
| **Remote Site (Right Panel)** | Shows files on the SERVER. This is where your website files live. |
| **Transfer Queue (Bottom)** | Shows files being uploaded/downloaded and their progress. |
| **Site Manager** | Save connection details so you don't re-enter them. Access: File → Site Manager |

---

## Transfer Protocols

| Protocol | Definition |
|----------|------------|
| **FTP** | File Transfer Protocol - basic file transfer method. Fast but NOT encrypted (data sent as plain text). |
| **SFTP** | SSH File Transfer Protocol - secure, encrypted version of FTP. Uses port 22. **Recommended!** |
| **FTPS** | FTP with SSL/TLS encryption. Similar security to SFTP. Uses port 990 or 21. |
| **SSL/TLS** | Security protocols that encrypt data during transfer. Same tech that makes "https" work. |

> **Pro Tip:** Always use SFTP when available! It keeps your username, password, and files secure.

---

## Server & Hosting Terms

| Term | Definition |
|------|------------|
| **Server** | A powerful computer that stores your website files and serves them to visitors 24/7. |
| **Web Hosting** | A service that rents you space on a server. Examples: Render, Netlify, GoDaddy, Bluehost. |
| **Root Directory** | Main/top-level folder of your website. Usually "public_html", "www", or "htdocs". |
| **public_html** | Most common name for your website's root folder. Files here are publicly accessible. |
| **Domain Name** | Your website's address (e.g., www.yoursite.com). Points to your server's location. |
| **IP Address** | Unique number identifying your server (e.g., 192.168.1.1). Domains are easier-to-remember versions. |
| **Bandwidth** | Amount of data that can transfer to/from your site. More bandwidth = more traffic capacity. |
| **Storage/Disk Space** | How much room for files on the server (MB or GB). Images/videos use the most. |

---

## File Permissions

| Permission | Definition |
|------------|------------|
| **CHMOD** | Command to change file permissions. In FileZilla: right-click → "File Permissions" |
| **Read (r or 4)** | Permission to view/open a file. Needed for visitors to see pages and images. |
| **Write (w or 2)** | Permission to modify or delete a file. Be careful who has this! |
| **Execute (x or 1)** | Permission to run a file as a program/script. Required for PHP and server-side code. |
| **Owner** | The user who created the file. Usually has full permissions. |

### Common Permission Numbers
| Number | Meaning | Use Case |
|--------|---------|----------|
| **755** | Owner: full, Others: read+execute | Folders |
| **644** | Owner: read+write, Others: read | Files |
| **777** | Everyone: full access | **Risky! Avoid!** |

> **Security Warning:** Never set 777 unless absolutely necessary - it allows anyone to read, write, and execute!

---

## Common FileZilla Actions

| Action | How To |
|--------|--------|
| **Upload** | Drag files from left (local) to right (server), or right-click → "Upload" |
| **Download** | Drag files from right (server) to left (local), or right-click → "Download" |
| **Overwrite** | FileZilla asks when a file with the same name exists - choose to replace or skip |
| **Refresh** | Press F5 or right-click → "Refresh" to see recent changes |
| **Quick Connect** | Use top bar for fast connections - enter host, username, password, port |
| **Abort** | Cancel transfer with X button in queue or Transfer → Cancel current operation |

---

## Common Web File Types

| Extension | Purpose |
|-----------|---------|
| **.html / .htm** | Web page structure. index.html is typically your homepage. |
| **.css** | Styles - controls colors, fonts, layouts, and visual design. |
| **.js** | JavaScript - adds interactivity (animations, forms, etc.) |
| **.jpg / .png / .gif / .webp** | Images. JPG for photos, PNG for transparency, GIF for animations. |
| **.php** | Server-side scripts for dynamic content. |
| **.htaccess** | Apache server config (redirects, security). Hidden file (starts with dot). |

---

## Troubleshooting Common Errors

| Error | Possible Solution |
|-------|-------------------|
| **Connection Refused** | Check if FTP is enabled, correct port, or firewall blocking. |
| **Authentication Failed** | Wrong username/password. They're case-sensitive! Contact hosting support. |
| **Connection Timed Out** | Server issues, network problems, or wrong host address. |
| **Permission Denied** | Check file permissions or contact hosting provider. |

---

## Quick Reference: Connecting to Monmouth Server

1. Open FileZilla
2. Enter **Host:** `zorak.monmouth.edu`
3. Enter **Username:** Your `s` + 7-digit ID (e.g., `s1234567`)
4. Enter **Password:** Your chosen FTP password
5. Enter **Port:** `21`
6. Click **Quickconnect**
7. Navigate to your `public_html` folder
8. Drag files to upload!

---

*Created for IEEE/ACM AI Workshops at Monmouth University*
*Questions? Contact s1358017@monmouth.edu*
