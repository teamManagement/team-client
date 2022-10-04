import { ComponentMeta, ComponentStory } from '@storybook/react'
import IconFont from '.'

export default {
  id: 'iconfont',
  title: 'iconfont图标',
  component: IconFont
} as ComponentMeta<typeof IconFont>

const Template: ComponentStory<typeof IconFont> = (args) => <IconFont {...args} />

export const Default = Template.bind({})
Default.storyName = '默认展示'
Default.args = {
  name: 'comment-dots'
}
