import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SystemMetric } from "@/types";
import { format } from "date-fns";

interface DataTableProps {
  data: SystemMetric[];
}

export const DataTable = ({ data }: DataTableProps) => {
  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>CPU Usage</TableHead>
            <TableHead>CPU Temp</TableHead>
            <TableHead>RAM Usage</TableHead>
            <TableHead>Disk Usage</TableHead>
            <TableHead>Net RX</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          ) : (
            data.slice(0, 10).map((metric) => (
              <TableRow key={metric.id}>
                <TableCell className="font-medium">
                  {(() => {
                    try {
                      return format(new Date(metric.timestamp), "yyyy-MM-dd HH:mm:ss");
                    } catch (e) {
                      return metric.timestamp;
                    }
                  })()}
                </TableCell>
                <TableCell>{metric.cpu_usage}%</TableCell>
                <TableCell>{metric.cpu_temp}°C</TableCell>
                <TableCell>{metric.ram_usage_percent.toFixed(1)}%</TableCell>
                <TableCell>{((metric.disk_usage_gb / metric.disk_total_gb) * 100).toFixed(1)}%</TableCell>
                <TableCell>{metric.net_rx_mb} MB/s</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
