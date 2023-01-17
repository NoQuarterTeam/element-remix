import type { ActionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { useSubmit } from "@remix-run/react"
import { z } from "zod"

import { ButtonGroup } from "~/components/ui/ButtonGroup"
import { Form, FormButton, FormError, FormField, ImageField } from "~/components/ui/Form"
import { db } from "~/lib/db.server"
import { validateFormData } from "~/lib/form"
import { badRequest } from "~/lib/remix"
import { UPLOAD_PATHS } from "~/lib/uploadPaths"
import { getUser } from "~/services/auth/auth.server"
import { FlashType, getFlashSession } from "~/services/session/flash.server"
import { getUserSession } from "~/services/session/session.server"

import { useMe } from "./_app"
import { Button } from "~/components/ui/Button"
import { AlertDialog } from "~/components/ui/AlertDialog"

export enum ProfileActionMethods {
  DeleteAcccount = "deleteAccount",
  UpdateProfile = "updateProfile",
}

export const action = async ({ request }: ActionArgs) => {
  const user = await getUser(request)
  const { createFlash } = await getFlashSession(request)
  const formData = await request.formData()
  const action = formData.get("_action") as ProfileActionMethods | undefined
  switch (action) {
    case ProfileActionMethods.UpdateProfile:
      try {
        const updateSchema = z.object({
          email: z.string().min(3).email("Invalid email").optional(),
          firstName: z.string().min(2, "Must be at least 2 characters").optional(),
          lastName: z.string().min(2, "Must be at least 2 characters").optional(),
          avatar: z.string().nullable().optional(),
        })
        const { data, fieldErrors } = await validateFormData(updateSchema, formData)
        if (fieldErrors) return badRequest({ fieldErrors, data })
        // Dont need to update email address if the same as the current one
        let updateData: Partial<typeof data> = { ...data }
        if (data.email === user.email) delete updateData.email
        if (data.avatar === "") updateData.avatar = null
        if (updateData.email) {
          const existing = await db.user.findFirst({ where: { email: { equals: updateData.email } } })
          if (existing) return badRequest({ data, formError: "User with these details already exists" })
        }
        await db.user.update({ where: { id: user.id }, data })
        return redirect("/timeline/profile", {
          headers: { "Set-Cookie": await createFlash(FlashType.Info, "Profile updated") },
        })
      } catch (e: any) {
        return badRequest(e.message, {
          headers: { "Set-Cookie": await createFlash(FlashType.Error, "Error updating profile") },
        })
      }
    case ProfileActionMethods.DeleteAcccount:
      try {
        await db.user.update({ where: { id: user.id }, data: { archivedAt: new Date() } })
        const { destroy } = await getUserSession(request)

        const headers = new Headers([
          ["Set-Cookie", await destroy()],
          ["Set-Cookie", await createFlash(FlashType.Info, "Acccount deleted")],
        ])
        return redirect("/", { headers })
      } catch (e: any) {
        return badRequest(e.message, {
          headers: { "Set-Cookie": await createFlash(FlashType.Error, "Error deleting acccount") },
        })
      }
    default:
      return badRequest("Invalid action", {
        headers: { "Set-Cookie": await createFlash(FlashType.Error, "Invalid action") },
      })
  }
}

export default function Account() {
  const logoutSubmit = useSubmit()
  const me = useMe()

  return (
    <div className="stack">
      <p className="text-lg font-medium">Account</p>

      <Form method="post" replace>
        <div className="stack">
          <FormField defaultValue={me.email} name="email" label="Email" />
          <FormField defaultValue={me.firstName} name="firstName" label="First name" />
          <FormField defaultValue={me.lastName} name="lastName" label="Last name" />
          <ImageField
            defaultValue={me.avatar}
            className="hidden text-center sq-24 xl:flex"
            label="Avatar"
            name="avatar"
            path={UPLOAD_PATHS.userAvatar(me.id)}
          />
          <FormError />
          <ButtonGroup>
            <FormButton name="_action" value={ProfileActionMethods.UpdateProfile}>
              Save
            </FormButton>
          </ButtonGroup>
        </div>
      </Form>
      <hr />
      <div>
        <Button variant="outline" onClick={() => logoutSubmit(null, { method: "post", action: "/logout" })}>
          Log out
        </Button>
      </div>
      <hr />
      <div className="stack">
        <p className="text-sm">Danger zone</p>
        <p className="text-xs">
          Permanently delete your account and all of its contents. This action is not reversible - please continue with caution.
        </p>
        <AlertDialog
          triggerButton={<Button colorScheme="red">Delete account</Button>}
          confirmButton={
            <Form method="post" replace>
              <Button name="_action" value={ProfileActionMethods.DeleteAcccount} colorScheme="red" type="submit">
                Delete account
              </Button>
            </Form>
          }
        />
      </div>
    </div>
  )
}
