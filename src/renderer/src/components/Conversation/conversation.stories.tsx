import { ComponentMeta, ComponentStory } from '@storybook/react'
import Conversation from '.'

export default {
  id: 'conversation',
  title: '谈话框',
  component: Conversation
} as ComponentMeta<typeof Conversation>

const Template: ComponentStory<typeof Conversation> = (args) => (
  <div>
    <Conversation {...args} />
  </div>
)

export const Default = Template.bind({})
Default.storyName = '默认'
