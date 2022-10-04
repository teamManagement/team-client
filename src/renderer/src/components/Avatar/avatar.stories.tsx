import { ComponentMeta, ComponentStory } from '@storybook/react'
import Avatar from '.'

export default {
  id: 'avatar',
  title: '头像',
  component: Avatar
} as ComponentMeta<typeof Avatar>

const Template: ComponentStory<typeof Avatar> = (args) => <Avatar {...args} />

export const DefaultAvatar = Template.bind({})
DefaultAvatar.storyName = '默认头像'
DefaultAvatar.args = {
  name: '张三'
}
