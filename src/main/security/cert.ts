import { pki, util, random, cipher } from 'node-forge'

const certPem = `-----BEGIN CERTIFICATE-----
MIIGTTCCBDWgAwIBAgIIOdDK9YDJjIMwDQYJKoZIhvcNAQELBQAwgZAxCzAJBgNV
BAYTAkNOMRAwDgYDVQQIEwdCZWlKaW5nMRAwDgYDVQQHEwdIYWlEaWFuMQ0wCwYD
VQQKEwRieXprMRUwEwYDVQQLDAzljY/kvZzlubPlj7AxGDAWBgNVBAMMD+WNj+S9
nOW5s+WPsC1DQTEdMBsGCSqGSIb3DQEJARYOYnlwdEBieXprLmluZm8wHhcNMjIx
MDA3MTYwMjAwWhcNMjMxMDA3MTYwMjAwWjCBgjELMAkGA1UEBhMCQ04xEDAOBgNV
BAgTB0JlaUppbmcxEDAOBgNVBAcTB0hhaURpYW4xDTALBgNVBAoTBGJ5emsxDTAL
BgNVBAsTBHRlYW0xEjAQBgNVBAMTCTEyNy4wLjAuMTEdMBsGCSqGSIb3DQEJARYO
YnlwdEBieXprLmluZm8wggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQCp
wg6IQ3l7J4xhqBP8+zXEuXW9LQzHd29LseO/1yx+5rmsbXHAO1r1tZMwqJWlYjmx
x97/L+WKmxwPeMlMep6/0dIUevCbHCnzP9TVqZjzMY+7HSiFgRDA3Oatut6ErgRh
TPyvGm9vWmfSQs29jaTjCXnAM68dN0SbRDTkssU5bqVD86gpAScyKjU5kDZIGI4H
Bommo2sCLiImRn322YeH4UXAgngsEmmjdRatmrc8yaUl+R+2ihcItjFfxVvqutHN
a7o6rLliVt9B7Tiz53lQ6kndvUm3wd0UoElSRHMw7cf2aJOaubZVlykQ6GH5m+EB
lIRzBNUzOK0xrcxHE9sHJT/J9te2pUbZ0LYT9LYsNrVOscv8MUZ735vIjTrzgzJY
v2T2e+d4L/ka9y22IRm+8n/YJfMnL8DU/URAPPgpRDRw/fvcchYyx9l830bb7dHq
2Y3bVNVplvRfOyIY58S63UqQjivB3XTiRt18/2YwdwUr4DOrMd2gmnXMqj7Bsopk
ZLYuyqjuJz4Jrhf4pJ3SnsTFh9JgcUD9RmKBsICTLPEz/SomQYsJyglUq8vkq7gX
6RpnigbUcvV9AY7tnb7qqCZ4h88ittgG6M6Dfnd66M6nzSKYYUgJwIXx6+YGMciV
vr8EecR2moKHgRjtySxTQnyIwGzBnos6JSCoYsq0CwIDAQABo4G2MIGzMAwGA1Ud
EwEB/wQCMAAwHQYDVR0OBBYEFPoOV7Bx9wT1JYcaQX0161yvUN9DMAsGA1UdDwQE
AwID+DAdBgNVHSUEFjAUBggrBgEFBQcDAQYIKwYBBQUHAwIwJQYDVR0RBB4wHIIJ
MTI3LjAuMC4xhwR/AAABggkxMjcuMC4wLjEwEQYJYIZIAYb4QgEBBAQDAgZAMB4G
CWCGSAGG+EIBDQQRFg94Y2EgY2VydGlmaWNhdGUwDQYJKoZIhvcNAQELBQADggIB
ADVTUji/Um7V9Mz2GlwK35NPM3mY4ImmpLXGf7gmcF9TAwD8mrFEFhLY4/CY0B7l
KwUH9R+sNSdZdSocpKx8W+9nLvmrI3q8w6pKrMZGjDUoN3gT+cXOtH7Zk+ce+f0I
PN6XGv/5ARQQsfYyWqcVUwkzZIceRZJnddoSe/61PEMh1GMa6xrwbhg+9oCr7rF4
qC2PXviT7qSS4MJGbHW9y0i50pRDx/J7p5DKM4GvcVSzCJl8PTO1j7bW4/w37blr
UAVN3xsqxU3jrniwTjpbEo+OCCfXXOkBNYZo5N3MJv3YO0LcX8pFBgrbnX67ShSp
MPSAMpBrC11szvZuyKVT70JECU1N6HUPkswhBMkNSpX1AdphhqGAGxq0W65x6S/u
CC0FpYhYHz1SakidGL5Fg9zGvqF7apwzU3hENnHu/yvzO3gSguY3FZE5aVaJYe6Y
fQCjHbZShg3MwjIbcw+hKRh9ZmwqWwt6Jil3VDVBc3wG6akdLuO0kF/d5GxHW1Qy
wanKeRMxX+fKoOxkW6e3qIMemCBTulJBozFM8/bvO905fJdAy8Py2QvCsMgjW2zN
c3JKlc1xo4eOu1kl9ANfaa3Drev9LaFCEmo5grBzXpfLAWpp9Tlj94eoPOeRMxAS
DhRc9ItnkDl60quRotDXasg5mzfd9ijn6lZlonzpDzMa
-----END CERTIFICATE-----
`

let publicKey: pki.rsa.PublicKey | undefined

export function parseCert(): void {
  const cert = pki.certificateFromPem(certPem)
  const val = cert.subject.getField('CN').value
  if (val !== '127.0.0.1') {
    throw new Error('证书被篡改')
  }
  publicKey = cert.publicKey as pki.rsa.PublicKey
}

export function aesEncrypt(originData: string): [string, string] {
  const aesKey = random.getBytesSync(16)
  const encBlocker = cipher.createCipher('AES-CBC', aesKey)
  encBlocker.start({
    iv: aesKey
  })
  encBlocker.update(util.createBuffer(originData))
  encBlocker.finish()
  return [util.bytesToHex(aesKey), encBlocker.output.toHex()]
}

export function rsaEncrypt(srcData: string): string {
  if (!publicKey) {
    parseCert()
  }

  return util.bytesToHex(publicKey!.encrypt(srcData))
}

export function localMessageEncrypt(originData: string): string {
  const [aesKey, encryptMessage] = aesEncrypt(originData)
  const encryptAesKey = rsaEncrypt(aesKey)
  return encryptAesKey + encryptMessage
}
