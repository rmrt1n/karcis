import Link from "next/link"
import { cookies } from "next/headers"
import { PlusCircledIcon } from "@radix-ui/react-icons"

import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { EventCard } from "@/components/event-card"
import { Database } from "@/lib/types/supabase"

const getEvents = async () => {
  const supabase = createServerComponentClient<Database>({ cookies })
  const { data: events, error } = await supabase
    .from("events")
    .select()
    .order("created_at", { ascending: false })

  console.log("fetched: ", events)
  if (error) {
    console.log(error)
  }

  return events
}

const Events = async () => {
  const events = await getEvents()

  // TODO: add ui for empty state
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Your events
          </h1>
          <p className="text-muted-foreground">
            Your upcoming and past events all in one place
          </p>
        </div>
        <Link href="/events/new" className={buttonVariants()}>
          <PlusCircledIcon className="mr-2 h-4 w-4" /> Create event
        </Link>
      </div>
      <Separator />
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {events?.map((event, i) => <EventCard key={i} event={event} />)}
      </div>
    </div>
  )
}

export default Events
