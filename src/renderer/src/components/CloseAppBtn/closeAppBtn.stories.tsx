import { ComponentMeta, ComponentStory } from '@storybook/react'
import CloseAppBtn from './closeBtn'

export default {
  id: 'closeBtn',
  title: '关闭按钮',
  component: CloseAppBtn
} as ComponentMeta<typeof CloseAppBtn>

const Template: ComponentStory<typeof CloseAppBtn> = (args) => <CloseAppBtn {...args} />

export const DefaultCloseAppBtn = Template.bind({})
DefaultCloseAppBtn.storyName = '默认关闭按钮'
DefaultCloseAppBtn.args = {
  color: 'black'
}
