import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Table } from "@tanstack/react-table"
import { Dispatch, SetStateAction } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  setData: Dispatch<SetStateAction<TData[]>>
  firstId: number
}

const toggleStatuses = async <TData,>(
  table: Table<TData>,
  setData: Dispatch<SetStateAction<TData[]>>,
  toast: any, // add the type later
  firstId: number,
) => {
  const selectedRowModels = table.getFilteredSelectedRowModel().rows
  if (selectedRowModels.length === 0) return

  const ids = selectedRowModels.map((rm) => parseInt(table.getRow(rm.id).getValue("id")) + firstId)
  const supabase = createClientComponentClient()
  // NOTE: batch updates not supported atm
  // https://github.com/supabase/postgrest-js/issues/174
  const { error } = await supabase.rpc("toggle_participants_statuses", { ids })

  if (error) {
    console.log(error)
    await toast({
      title: "Uh oh! Something went wrong.",
      description: "Something went wrong with your request",
      variant: "destructive",
    })
    return
  }

  const lookupStatusById = selectedRowModels.reduce(
    (acc, cur) => {
      const row = table.getRow(cur.id)
      acc[row.getValue("id") as number] = !row.getValue("status")
      return acc
    },
    {} as { [id: number]: boolean },
  )
  setData((prev) =>
    prev.map((row) => {
      // @ts-ignore
      const newStatus = lookupStatusById[row.id]
      if (newStatus === undefined) return row
      return { ...row, status: newStatus }
    }),
  )
  selectedRowModels.forEach((rm) => table.getRow(rm.id).toggleSelected())
  await toast({
    title: "Success!",
    description: "Participant statuses successfully updated",
  })
}

export const DataTableToolbar = <TData,>({
  table,
  setData,
  firstId,
}: DataTableToolbarProps<TData>) => {
  const { toast } = useToast()

  // TODO: use global filter here
  return (
    <div className="flex items-center justify-between gap-2">
      <Input
        placeholder="Filter string..."
        value={
          (table.getColumn("email")?.getFilterValue() as string) ??
          // HACK: users can search for present/absent using 1/0. ugly but works for now
          (table.getColumn("status")?.getFilterValue() as string) ??
          ""
        }
        onChange={(event) => table.getColumn("email")?.setFilterValue(event.target.value)}
        className="max-w-sm"
      />
      <Button
        variant="outline"
        onClick={async () => await toggleStatuses(table, setData, toast, firstId)}
        className="whitespace-nowrap"
      >
        Toggle status
      </Button>
    </div>
  )
}
