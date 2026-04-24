<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:html="http://www.w3.org/1999/xhtml"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>XML Sitemap</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            font-size: 14px;
            color: #333;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
          }
          .header {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          h1 {
            margin: 0 0 10px 0;
            font-size: 24px;
            color: #1a73e8;
          }
          .info {
            color: #666;
            font-size: 13px;
          }
          table {
            background: #fff;
            border-radius: 8px;
            width: 100%;
            border-collapse: collapse;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          th {
            background: #1a73e8;
            color: #fff;
            padding: 12px;
            text-align: left;
            font-weight: 600;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #eee;
          }
          tr:last-child td {
            border-bottom: none;
          }
          tr:hover {
            background: #f8f9fa;
          }
          a {
            color: #1a73e8;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          .url-cell {
            max-width: 500px;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>XML Sitemap</h1>
          <p class="info">
            This is an XML Sitemap for search engines like Google, Bing, and Yahoo.
            <br/>
            Total URLs in this sitemap: <strong><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></strong>
          </p>
        </div>
        <table>
          <tr>
            <th>URL</th>
            <th>Last Modified</th>
            <th>Change Frequency</th>
            <th>Priority</th>
          </tr>
          <xsl:for-each select="sitemap:urlset/sitemap:url">
            <tr>
              <td class="url-cell">
                <a href="{sitemap:loc}">
                  <xsl:value-of select="sitemap:loc"/>
                </a>
              </td>
              <td>
                <xsl:value-of select="sitemap:lastmod"/>
              </td>
              <td>
                <xsl:value-of select="sitemap:changefreq"/>
              </td>
              <td>
                <xsl:value-of select="sitemap:priority"/>
              </td>
            </tr>
          </xsl:for-each>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
