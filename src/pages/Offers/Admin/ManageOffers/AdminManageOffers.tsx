"use client"

import React, { useState, useEffect } from "react"
import { FaSortUp, FaSortDown, FaPlus } from "react-icons/fa"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Breadcrumb from "../../../../components/Breadcrumbs/Breadcrumb"
import SearchBar from "../../../../components/Table/SearchBar"
import Pagination from "../../../../components/Table/Pagination"
import { Link, useNavigate } from "react-router-dom"
import Select from "react-select"
import Button from "../../../../components/Forms/Button"
import { FiEdit, FiXCircle, FiTrash2 } from "react-icons/fi"
import Swal from "sweetalert2"

interface AdminOffer {
    id: string
    projectName: string
    offerType: "Public" | "Private"
    createdDate: string
    registrationDueDate: string
    status: "Open" | "Closed"
    totalSuppliers: number
    winningCompany: string | null
}

// Simulated API function for admin offers
const fetchAdminManageOffers = async (): Promise<AdminOffer[]> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return Array.from({ length: 10 }, (_, i) => ({
        id: `offer-${i + 1}`,
        projectName: `Project ${i + 1}`,
        offerType: Math.random() > 0.5 ? "Public" : "Private",
        createdDate: new Date(
            Date.now() - Math.floor(Math.random() * 10000000000)
        )
        .toISOString()
        .split("T")[0],
        registrationDueDate: new Date(
            Date.now() + Math.floor(Math.random() * 10000000000)
        )
        .toISOString()
        .split("T")[0],
        status: Math.random() > 0.3 ? "Open" : "Closed",
        totalSuppliers: Math.floor(Math.random() * 100) + 1,
        winningCompany:
        Math.random() > 0.7 ? `Company ${Math.floor(Math.random() * 100)}` : null,
    }))
}

const AdminManageOffers: React.FC = () => {
    const [offers, setOffers] = useState<AdminOffer[]>([])
    const [filteredOffers, setFilteredOffers] = useState<AdminOffer[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
        key: "",
        direction: "asc",
    })
    const navigate = useNavigate()

    useEffect(() => {
        const loadOffers = async () => {
            try {
                const data = await fetchAdminManageOffers()
                setOffers(data)
                setFilteredOffers(data)
            } catch (error) {
                toast.error("Failed to load offers")
            } finally {
                setLoading(false)
            }
        }
        loadOffers()
        const savedPage = localStorage.getItem("admin_offers_current_page")
        if (savedPage) {
            setCurrentPage(parseInt(savedPage))
        }
    }, [])

    useEffect(() => {
        let filtered = [...offers]
        if (searchQuery) {
            filtered = filtered.filter((o) =>
                o.projectName.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }
        if (statusFilter && statusFilter !== "all") {
            filtered = filtered.filter((o) => o.status === statusFilter)
        }
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let aValue: any = a[sortConfig.key as keyof AdminOffer]
                let bValue: any = b[sortConfig.key as keyof AdminOffer]

                if (sortConfig.key === "createdDate" || sortConfig.key === "registrationDueDate") {
                aValue = new Date(aValue).toISOString()
                bValue = new Date(bValue).toISOString()
                }
                if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
                if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
                return 0
            })
        }
        setFilteredOffers(filtered)
        setCurrentPage(1)
    }, [searchQuery, statusFilter, sortConfig, offers])

    const handleSort = (key: keyof AdminOffer) => {
        let direction: "asc" | "desc" = "asc"
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc"
        }
        setSortConfig({ key, direction })
    }

    const paginatedOffers = filteredOffers.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    )

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        localStorage.setItem("admin_offers_current_page", page.toString())
    }

    // Dummy action functions
    const handleEdit = (offer: AdminOffer) => {
        navigate(`/offers/edit/${offer.id}`)
    }

    const handleClose = (offerId: string) => {
        Swal.fire({
            title: "Close Offer",
            text: "Are you sure you want to close this offer?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, close it",
            cancelButtonText: "No, keep it open",
            confirmButtonColor: "#2F4F4F",
            cancelButtonColor: "#dc2626",
        }).then((result) => {
            if (result.isConfirmed) {
                setOffers((prev) =>
                    prev.map((offer) =>
                        offer.id === offerId ? { ...offer, status: "Closed" } : offer
                    )
                )
                toast.success("Offer closed successfully")
            }
        })
    }
    

    const handleRemove = (offerId: string) => {
        Swal.fire({
            title: "Remove Offer",
            text: "Are you sure you want to remove this offer?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, remove it",
            cancelButtonText: "No, keep it",
            confirmButtonColor: "#2F4F4F",
            cancelButtonColor: "#dc2626",
        }).then((result) => {
            if (result.isConfirmed) {
                setOffers((prev) => prev.filter((offer) => offer.id !== offerId))
                toast.success("Offer removed successfully")
            }
        })
    }

    return (
        <>
            <Breadcrumb pageName="Manage Offers" />
            <ToastContainer position="top-right" />
            <div className="bg-white">
                <div className="p-2 md:p-4 lg:p-6 space-y-6">
                    <Button
                        onClick={() => navigate("/offers/create")}
                        title="Create Offers"
                        icon={FaPlus}
                        className="px-4 py-2 flex items-center gap-2"
                    />
                    {offers.length === 0 && !loading ? (
                        <div className="text-center">
                            <p className="mb-4">No offers available.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                                <div className="w-full lg:w-1/2">
                                    <SearchBar placeholder="Search project name..." onSearchChange={setSearchQuery} />
                                </div>
                                <div className="w-full lg:w-1/3">
                                    <Select
                                        options={[
                                        { value: "all", label: "All Statuses" },
                                        { value: "Open", label: "Open" },
                                        { value: "Closed", label: "Closed" },
                                        ]}
                                        value={
                                        statusFilter
                                            ? {
                                                value: statusFilter,
                                                label: statusFilter === "all" ? "All Statuses" : statusFilter,
                                            }
                                            : null
                                        }
                                        onChange={(e: any) => setStatusFilter(e.value)}
                                        placeholder="Filter by Status"
                                    />
                                </div>
                            </div>

                            <div className="relative overflow-hidden shadow-md rounded-lg border border-gray-300">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b">
                                                    Project Name
                                                </th>
                                                <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b cursor-pointer" onClick={() => handleSort("offerType")}>
                                                    <span className="flex items-center justify-center">
                                                        Offer Type
                                                    </span>
                                                </th>
                                                <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b cursor-pointer" onClick={() => handleSort("createdDate")}>
                                                    <span className="flex items-center justify-center">
                                                        {sortConfig.key === "createdDate" ? (
                                                        sortConfig.direction === "asc" ? (
                                                            <FaSortUp className="mr-1" />
                                                        ) : (
                                                            <FaSortDown className="mr-1" />
                                                        )
                                                        ) : (
                                                        <FaSortDown className="opacity-50 mr-1" />
                                                        )}
                                                            Created Date
                                                    </span>
                                                </th>
                                                <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b cursor-pointer" onClick={() => handleSort("registrationDueDate")}>
                                                <span className="flex items-center justify-center">
                                                    {sortConfig.key === "registrationDueDate" ? (
                                                    sortConfig.direction === "asc" ? (
                                                        <FaSortUp className="mr-1" />
                                                    ) : (
                                                        <FaSortDown className="mr-1" />
                                                    )
                                                    ) : (
                                                        <FaSortDown className="opacity-50 mr-1" />
                                                    )}
                                                        Registration Due
                                                </span>
                                                </th>
                                                <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b">
                                                    Registration Status
                                                </th>
                                                <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b">
                                                    Total Suppliers
                                                </th>
                                                <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b">
                                                    Winning Company
                                                </th>
                                                <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b">
                                                    Edit
                                                </th>
                                                <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                        {loading ? (
                                            Array.from({ length: rowsPerPage }).map((_, index) => (
                                                <tr key={index} className="animate-pulse">
                                                    {Array.from({ length: 9 }).map((_, cellIndex) => (
                                                    <td key={cellIndex} className="px-3 py-3 text-center">
                                                        <div className="h-4 bg-gray-200 rounded"></div>
                                                    </td>
                                                    ))}
                                                </tr>
                                            ))
                                        ) : paginatedOffers.length > 0 ? (
                                            paginatedOffers.map((offer) => (
                                            <tr key={offer.id} className="hover:bg-gray-50">
                                                <td className="px-3 py-3 text-center whitespace-nowrap">
                                                    <Link
                                                        to={`/offers/details/${offer.id}`}
                                                        className="text-blue-600 underline font-medium hover:text-blue-800"
                                                    >
                                                        {offer.projectName}
                                                    </Link>
                                                </td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap">
                                                    {offer.offerType}
                                                </td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap">
                                                    {offer.createdDate}
                                                </td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap">
                                                    {offer.registrationDueDate}
                                                </td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap">
                                                    {offer.status}
                                                </td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap">
                                                    {offer.totalSuppliers}
                                                </td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap">
                                                    {offer.winningCompany || "-"}
                                                </td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap">
                                                    <Button
                                                        onClick={() => handleEdit(offer)}
                                                        title="Edit"
                                                        icon={FiEdit}
                                                        className="px-2 py-1"
                                                    />
                                                </td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap">
                                                    <div className="flex justify-center gap-2">
                                                        <Button
                                                            onClick={() => handleClose(offer.id)}
                                                            title="Close"
                                                            icon={FiXCircle}
                                                            className="px-2 py-1"
                                                            disabled={offer.status === "Closed"}
                                                        />
                                                        <Button
                                                            onClick={() => handleRemove(offer.id)}
                                                            title="Remove"
                                                            icon={FiTrash2}
                                                            color="bg-red-600"
                                                            className="px-2 py-1"
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={9} className="px-3 py-4 text-center text-gray-500">
                                                    No offers available.
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <Pagination
                                totalRows={filteredOffers.length}
                                rowsPerPage={rowsPerPage}
                                currentPage={currentPage}
                                onPageChange={handlePageChange}
                                onRowsPerPageChange={setRowsPerPage}
                            />
                        </>
                    )}
                </div>
            </div>
        </>
    )
}

export default AdminManageOffers