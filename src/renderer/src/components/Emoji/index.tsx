import { IEmojiItem } from '../ImInput/interface'
import { FC } from 'react'
import emojiData from './emoji.json'
import './index.scss'

export const emojiReplaceReg = /\[[^[]+?\]/g
export const emojiMap: { [key: string]: string } = {}

for (const item of emojiData) {
  emojiMap[item.key] = item.data
}

export interface EmojiProps {
  click?(emojiItem: IEmojiItem): void
}

export const Emoji: FC<EmojiProps> = ({ click }) => {
  const emojiElements = emojiData.map((emoji) => {
    return (
      <div
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        onClick={() => {
          click && click(emoji)
        }}
        key={emoji.key}
        className="emoji_content_item"
      >
        <img src={emoji.data} alt={emoji.key} title={emoji.key} />
      </div>
    )
  })
  return <div className="emoji">{emojiElements}</div>
}
