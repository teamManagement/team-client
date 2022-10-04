import { pki, util, random, cipher } from 'node-forge'

const certPem = `-----BEGIN CERTIFICATE-----
MIIEpTCCA42gAwIBAgIIfCU0g2W1TmQwDQYJKoZIhvcNAQELBQAwgYYxCzAJBgNV
BAYTAnpoMRAwDgYDVQQIEwdCZWlKaW5nMRAwDgYDVQQHEwdCZWlKaW5nMQ0wCwYD
VQQKEwRieXprMQ0wCwYDVQQLEwR0ZWFtMRYwFAYDVQQDEw10ZWFtIHBsYXRmb3Jt
MR0wGwYJKoZIhvcNAQkBFg5ieXB0QGJ5emsuaW5mbzAeFw0yMjEwMDMwODE2MDBa
Fw0yMzEwMDMwODE2MDBaMGwxCzAJBgNVBAYTAnpoMRAwDgYDVQQIEwdCZWlqaW5n
MRAwDgYDVQQHEwdCZWlqaW5nMQ0wCwYDVQQKEwRieXprMQ0wCwYDVQQLEwR0ZWFt
MRswGQYDVQQDExJ0ZWFtIGNsaWVudCBzZXJ2ZXIwggIiMA0GCSqGSIb3DQEBAQUA
A4ICDwAwggIKAoICAQCpxPHEv92hD2lv8SO8BPuNNx6DKItgTQzW6037WWj4XZ+l
1nrjxburacwzqx7kolnrljZ2gkYlCPa0BvLVPdJa5G2VBa1IPt3tUIQ7MkuPmtx9
jxYG9yHW0s6DfJprihLBjw9lX6YARPAb6/PKiQWafd/HOi+Y75kvFvZkvucnjyYm
0aKFI9ZwlRh0burAi3XYW3X65KImm34/A9OIjzUwvv2u0mqxjgfqmJTTSql+w3zn
Eep94zlZuxxzse1DDHdVKS91GvFrmWf535byjjOZ8ao76H6UYiqwT6v1E9C57tlK
oZ+SsGvrDpHyNITn9xbtOg4tuUlkW2q6wOkMIfWggbZ3eWj2fSe4mF90WIrgac+8
DWMJtk0zMl4CG5geWLkqYngrP3eURWPX6gbG3XjPmD/aiQeGtgcmGWZAMX50FfwD
FqASkSUuMW/uFcb6zb8A/dxS0oItNF9lZnm0rd/+Gj9sbmt7Z2Pb090ax7V+nFFJ
VBkuE0AHfp3LE4TN5TcoaONXGBD1bq3IKP2SpbBf9RlizzZv0h+ToTOqIy3fA9JD
C4UsNUygNHvAv3x15VvueMGpXRvpcz9gdO4r3d8JqycOIbF13eKdBG3j30RxjuYb
nghInoV0U8V51+wmpnOQPYjBeUf1wivHUmiiGGb5yq9rScrVPPw2/WJZxXPTXQID
AQABozAwLjAMBgNVHQ8EBQMDBxGAMB4GCWCGSAGG+EIBDQQRFg94Y2EgY2VydGlm
aWNhdGUwDQYJKoZIhvcNAQELBQADggEBAG0mscUQUtxmKBXyD7jl86uSIfImPYo7
oA70mxg9u/TXFEvVuWpTZ25AQACEoUgSthetouqyf0XNB/FJsfu+lSBK2+bFSuRl
4vG++QFTtOfCsmeozZbqpWHO5z3EhfUczZBSX8IgATKnPaI8aHNpTyrhIH4glU8V
pZTZ0xUQJClx1U11fC8WdrGFMN3El0l8y5/pzcF0z3YSiPnTEeywIHw5LKcNibDm
IhMJMDQz/1yxO+vnqlfridq8J3LzmgQ4HmOynLAG96YhJIj+prnRTMEI+fbaRO5V
OuGjGJc2pyxBipSnPtRMqWkdiby0ypM+8Jq9DWStnVjvAziYdxsgxjE=
-----END CERTIFICATE-----
`

let publicKey: pki.rsa.PublicKey | undefined

export function parseCert(): void {
  const cert = pki.certificateFromPem(certPem)
  const val = cert.subject.getField('CN').value
  if (val !== 'team client server') {
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
