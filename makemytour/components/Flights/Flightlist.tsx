"use client";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table';
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { getflight } from '@/app/api';

export default function Flights({ onSelect }: any) {
    const [flight, setflight] = useState<any[]>([])
    const [loading, setloading] = useState(true)

    useEffect(() => {
        const fetchflight = async () => {
            try {
                const data = await getflight()
                setflight(data);
            } catch (error) {
                console.error(error)
            } finally {
                setloading(false)
            }
        }
        fetchflight()
    }, [])

    if (loading) {
        return <div>Loading..</div>
    }

    return (
        <div className="rounded-xl border border-white/60 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="border-white/60 hover:bg-transparent bg-white/50">
                        <TableHead className="text-[#0f1a2e] font-bold uppercase text-xs tracking-wide">Flight Name</TableHead>
                        <TableHead className="text-[#0f1a2e] font-bold uppercase text-xs tracking-wide">From</TableHead>
                        <TableHead className="text-[#0f1a2e] font-bold uppercase text-xs tracking-wide">To</TableHead>
                        <TableHead className="text-[#0f1a2e] font-bold uppercase text-xs tracking-wide text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {flight.length > 0 ? (
                        flight.map((f: any) => (
                            <TableRow
                                key={f._id}
                                className="border-white/40 hover:bg-white/40 transition-colors"
                            >
                                <TableCell className="font-semibold text-[#0f1a2e] text-[15px]">
                                    {f.flightName}
                                </TableCell>
                                <TableCell className="text-[#2c3e57] text-[15px]">{f.from}</TableCell>
                                <TableCell className="text-[#2c3e57] text-[15px]">{f.to}</TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        size="sm"
                                        onClick={() => onSelect(f)}
                                        className="bg-[#0f1a2e] text-white hover:bg-[#1a2947] font-semibold rounded-lg shadow-md"
                                    >
                                        Edit
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-[#3d5170] py-6">
                                No data
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

