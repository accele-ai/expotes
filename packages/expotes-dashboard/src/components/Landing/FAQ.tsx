import { Icon } from '@iconify/react'
import { Accordion, AccordionItem } from '@nextui-org/react'

const faqs = [
  {
    title: 'What is Acme?',
    content:
      'Acme is a design system for building performant, accessible and beautiful web experiences.',
  },
  {
    title: 'How can I apply to the Open Source Discount?',
    content:
      'The Open Source Discount is available for everyone who is building an open source project. You can apply to the discount by sending an email to support@acme.com',
  },
  {
    title: 'Can I use Acme for my freelance projects?',
    content:
      'Yes, you can use Acme for your freelance projects. You can purchase the Freelancer License from our website.',
  },
  {
    title: 'What is your refund policy?',
    content:
      'We do not provide refunds. However, we can help you with any issues you may have.',
  },
  {
    title: 'Can I cancel my subscription?',
    content: 'Yes, you can cancel and renew your subscription at any time.',
  },
  {
    title: 'How do I switch from quarterly to yearly subscription?',
    content:
      'You can switch from quarterly to yearly subscription by canceling your quarterly subscription and purchasing a yearly subscription.',
  },
  {
    title: 'Do you have monthly payment plans?',
    content:
      'No, we do not provide monthly payment plans. You can purchase a quarterly or yearly subscription.',
  },
  {
    title: 'Do you have discounts for students?',
    content:
      'Yes, we provide a 50% discount for students. You can apply to the discount by sending an email to support@acme.com',
  },
  {
    title: 'Do you have discounts for startups?',
    content:
      'Yes, we provide a 50% discount for startups. You can apply to the discount by sending an email to support@acme.com',
  },
  {
    title: 'How often do you release updates?',
    content: 'We release updates every two weeks.',
  },
]

export default function FAQ() {
  return (
    <section className="mx-auto w-full max-w-6xl py-20 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 lg:flex-row lg:items-start lg:gap-12">
        <h2 className="px-2 text-3xl leading-7">
          <span className="inline-block lg:hidden">FAQs</span>
          <h2 className="from-foreground-800 to-foreground-500 dark:to-foreground-200 hidden bg-gradient-to-br bg-clip-text pt-4 text-5xl font-semibold tracking-tight text-transparent lg:inline-block">
            Frequently
            <br />
            asked
            <br />
            questions
          </h2>
        </h2>
        <Accordion
          fullWidth
          keepContentMounted
          className="gap-3"
          itemClasses={{
            base: 'px-0 sm:px-6',
            title: 'font-medium',
            trigger: 'py-6 flex-row-reverse',
            content: 'pt-0 pb-6 text-base text-default-500',
          }}
          items={faqs}
          selectionMode="multiple"
        >
          {faqs.map((item, i) => (
            <AccordionItem
              key={i}
              indicator={<Icon icon="lucide:plus" width={24} />}
              title={item.title}
            >
              {item.content}
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
