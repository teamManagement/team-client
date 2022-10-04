import { ComponentMeta, ComponentStory } from '@storybook/react'
import MessageCard from '.'

export default {
  id: 'message-card',
  title: '消息卡片',
  component: MessageCard
} as ComponentMeta<typeof MessageCard>

const Template: ComponentStory<typeof MessageCard> = (args) => (
  <div style={{ width: 350 }}>
    <MessageCard {...args} />
  </div>
)

export const Default = Template.bind({})
Default.storyName = '默认卡片'
