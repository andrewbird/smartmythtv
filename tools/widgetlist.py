#!/usr/bin/env python

from os import stat

# configure as follows in /etc/apache2/sites-enabled/smarttv.conf
# ScriptAliasMatch ^/widgetlist.xml$ /var/www/html/SamsungSmartTV/widgetlist.py

# sample call from real TV (lounge)
# 192.168.3.205 - - [17/Feb/2014:16:23:58 +0000] "GET /widgetlist.xml HTTP/1.1" 200 542 "-" "Mozilla/5.0 (SmartHub; SMART-TV; U; Linux/SmartTV; Maple2012) AppleWebKit/534.7 (KHTML, like Gecko) SmartTV Safari/534.7"
# 192.168.3.205 - - [17/Feb/2014:16:24:00 +0000] "GET /SamsungSmartTV/SmartMythTV_0.4.3_Europe_20130805.zip HTTP/1.1" 200 164586 "-" "-"

FNAME = "SmartMythTV_0.4.3_Europe_20130805.zip"
FNAME = "SmartMythTV_0.4.4_Europe_20210123.zip"

TEMPLATE = """\
<?xml version="1.0" encoding="UTF-8"?>
<rsp stat="ok">
  <list>
    <widget id="MyMythTV">
      <title>MyMythTV</title>
      <compression size="%s" type="zip"/>
      <description>My MythTV</description>
      <download>http://192.168.3.45/SamsungSmartTV/%s</download>
    </widget>
  </list>
</rsp>"""

print "Content-Type: text/html\n"

print TEMPLATE % (stat(FNAME).st_size, FNAME)
