import { ComponentMeta, ComponentStory } from '@storybook/react'
import { UserIcon, SettingIcon } from 'tdesign-icons-react'
import ChatTitle from '.'

export default {
  id: 'chat-title',
  title: '聊天信息标题',
  component: ChatTitle
} as ComponentMeta<typeof ChatTitle>

const Template: ComponentStory<typeof ChatTitle> = (args) => (
  <div>
    <ChatTitle {...args} />
  </div>
)

export const Default = Template.bind({})
Default.storyName = '默认'
Default.args = {
  children: [<UserIcon size="22px" key="1" />, <SettingIcon size="22px" key="2" />]
}
