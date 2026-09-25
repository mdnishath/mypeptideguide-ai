/** The guide flow: no site chrome. The flow draws its own minimal top bar. */
export default function FlowLayout({ children }: { children: React.ReactNode }) {
  return <main className="flex flex-1 flex-col">{children}</main>;
}
