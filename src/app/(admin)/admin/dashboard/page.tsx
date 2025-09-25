import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to the Admin Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            This is the main dashboard area. Use the sidebar navigation to
            manage different aspects of Review4it.
          </p>
          <p className="mt-4">
            You can start by exploring the sections in the sidebar, such as
            "Movie Management" or "News & Facts".
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats (Placeholder)</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total Movies: 150</p>
            <p>Users Online: 12</p>
            <p>Pending Approvals: 3</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity (Placeholder)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>New movie "Galaxy Quest III" added.</li>
              <li>User "john.doe" updated profile.</li>
              <li>Earnings report generated for last week.</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>System Health (Placeholder)</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Status: <span className="text-green-500">Operational</span>
            </p>
            <p>Last Backup: Today, 02:00 AM</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
