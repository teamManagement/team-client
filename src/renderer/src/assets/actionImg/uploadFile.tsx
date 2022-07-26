import { FC, HTMLAttributes } from 'react'
import { ImgBase } from './_base'

export const ImgUploadFile: FC<HTMLAttributes<HTMLImageElement>> = (props) => {
  return (
    <ImgBase
      {...props}
      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAUCAYAAABiS3YzAAAAAXNSR0IArs4c6QAAAcZJREFUOE/t1LFLG3EUB/Dv92KSO6hoKWJBK4gODhWEdumWwaUuSYZbhAtObUmxFxAUydKhiODQnFbaoYtXFRUkiU6OBZF20j9BcFOsZuii3u/JpURTK16MuPXW33uf9/i93z3iHj76ZsxMP2jWw68BPv2rBrlTcD86t63LATP9OKKHN0l2AXIA8LePCBAi8EREtgGWAuASqfJ5d3rOj2MilckRGFJKDRTnp7eqkxOWPQJgCuD3ALSdRLdSMlWcd0aZTGUOBVguuLn01cSX5nCLboT2zzzvxfrCzI+b4Lj17oNGLXsiqtdHBZ6M5xecyX+STDOUNNr8okcUDgXdrVBtANrYzSiAxGCmjw3YDgIr5wK8D0T94PIwo5GeIJiarAg4WxMahFXOk5a9J+TX/+jlk/J/14d69NnFJD0pFRZzO3e607iVeasRn6qQX3k39+hOaHmxRCPPK4g680prSzM1v9Hq6R8KZLHgOsO1dnRdXCwWa2ju6DsGmGUyZX8BaHrw+tfc2ru6Csct+7NGvpETdP5ZfUb4J8EOAXbr6ZaCVhCGgmSLrjNRXtL95qumRt2wBeysBxXIKYDV4jdno7xP60GCcs4BUlLmMOQZslIAAAAASUVORK5CYII="
    />
  )
}
