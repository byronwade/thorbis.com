"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Badge } from "@components/ui/badge";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Separator } from "@components/ui/separator";
import { toast } from "sonner";
import { ROLES, RoleManager, PERMISSIONS } from "@lib/auth/roles";
import { useAuth } from "@context/auth-context";
import { usePermissions } from "@features/auth";
import { Search, User, Shield, Settings, Edit, Trash2, Save, X, AlertTriangle } from "lucide-react";
import logger from "@lib/utils/logger";

/**
 * Comprehensive permission management interface
 * Provides role assignment, permission editing, and user management
 */
export default function PermissionManager() {
	const { user } = useAuth();
	const { checkPermission, getUserLevel } = usePermissions();
	const [users, setUsers] = useState([]);
	const [selectedUser, setSelectedUser] = useState(null);
	const [loading, setLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState("users");

	// Check if user can manage roles
	const canManageRoles = checkPermission(PERMISSIONS.ROLES_MANAGE);
	const canManageUsers = checkPermission(PERMISSIONS.USER_MANAGE);
	const userLevel = getUserLevel();

	useEffect(() => {
		if (canManageUsers) {
			fetchUsers();
		}
	}, [canManageUsers]);

	const fetchUsers = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/admin/users");
			if (response.ok) {
				const data = await response.json();
				setUsers(data.users);
			} else {
				throw new Error("Failed to fetch users");
			}
		} catch (error) {
			logger.error("Failed to fetch users:", error);
			toast.error("Failed to load users");
		} finally {
			setLoading(false);
		}
	};

	const updateUserRoles = async (userId, newRoles) => {
		try {
			setLoading(true);

			// Check if user can assign these roles
			const canAssignAllRoles = newRoles.every((role) => RoleManager.canAssignRole(user.roles, role));

			if (!canAssignAllRoles) {
				toast.error("You cannot assign roles higher than your own level");
				return;
			}

			const response = await fetch(`/api/admin/users/${userId}/roles`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ roles: newRoles }),
			});

			if (response.ok) {
				await fetchUsers();
				toast.success("User roles updated successfully");

				// Log the change
				logger.info("User roles updated", {
					adminId: user.id,
					targetUserId: userId,
					newRoles,
					timestamp: Date.now(),
				});
			} else {
				const error = await response.json();
				throw new Error(error.message || "Failed to update roles");
			}
		} catch (error) {
			logger.error("Failed to update user roles:", error);
			toast.error(error.message || "Failed to update user roles");
		} finally {
			setLoading(false);
		}
	};

	const deleteUser = async (userId) => {
		if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
			return;
		}

		try {
			setLoading(true);

			const response = await fetch(`/api/admin/users/${userId}`, {
				method: "DELETE",
			});

			if (response.ok) {
				await fetchUsers();
				setSelectedUser(null);
				toast.success("User deleted successfully");

				// Log the deletion
				logger.security({
					action: "user_deleted",
					adminId: user.id,
					deletedUserId: userId,
					timestamp: Date.now(),
				});
			} else {
				const error = await response.json();
				throw new Error(error.message || "Failed to delete user");
			}
		} catch (error) {
			logger.error("Failed to delete user:", error);
			toast.error(error.message || "Failed to delete user");
		} finally {
			setLoading(false);
		}
	};

	const filteredUsers = users.filter((u) => u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()));

	if (!canManageUsers && !canManageRoles) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Shield className="h-5 w-5" />
						Permission Manager
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Alert>
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription>You don&apos;t have permission to manage users or roles.</AlertDescription>
					</Alert>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Shield className="h-5 w-5" />
						Permission Manager
					</CardTitle>
					<CardDescription>Manage user roles and permissions across the platform</CardDescription>
				</CardHeader>
			</Card>

			{/* Navigation Tabs */}
			<div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
				{canManageUsers && (
					<Button variant={activeTab === "users" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("users")} className="px-4">
						<User className="h-4 w-4 mr-2" />
						Users
					</Button>
				)}
				{canManageRoles && (
					<Button variant={activeTab === "roles" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("roles")} className="px-4">
						<Shield className="h-4 w-4 mr-2" />
						Roles
					</Button>
				)}
				<Button variant={activeTab === "permissions" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("permissions")} className="px-4">
					<Settings className="h-4 w-4 mr-2" />
					Permissions
				</Button>
			</div>

			{/* Users Tab */}
			{activeTab === "users" && canManageUsers && (
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* User List */}
					<div className="lg:col-span-2">
						<Card>
							<CardHeader>
								<CardTitle>User Management</CardTitle>
								<div className="flex items-center space-x-2">
									<Search className="h-4 w-4 text-muted-foreground" />
									<Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="max-w-sm" />
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{filteredUsers.map((u) => (
										<UserCard key={u.id} user={u} onSelect={setSelectedUser} selected={selectedUser?.id === u.id} currentUserLevel={userLevel} />
									))}
									{filteredUsers.length === 0 && <div className="text-center py-8 text-muted-foreground">{searchQuery ? "No users found matching your search" : "No users found"}</div>}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* User Details */}
					<div>
						{selectedUser ? (
							<UserDetails user={selectedUser} onUpdate={updateUserRoles} onDelete={deleteUser} loading={loading} currentUserLevel={userLevel} />
						) : (
							<Card>
								<CardContent className="pt-6">
									<div className="text-center text-muted-foreground">
										<User className="h-12 w-12 mx-auto mb-4 opacity-50" />
										<p>Select a user to view details</p>
									</div>
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			)}

			{/* Roles Tab */}
			{activeTab === "roles" && canManageRoles && <RoleOverview />}

			{/* Permissions Tab */}
			{activeTab === "permissions" && <PermissionOverview />}
		</div>
	);
}

/**
 * User card component
 */
function UserCard({ user, onSelect, selected, currentUserLevel }) {
	const userLevel = RoleManager.getHighestRoleLevel(user.roles || []);
	const canManage = currentUserLevel > userLevel;

	return (
		<div className={`p-4 border rounded-lg cursor-pointer transition-colors ${selected ? "border-primary bg-primary dark:bg-primary" : "hover:bg-muted"}`} onClick={() => onSelect(user)}>
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-3">
					<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">{user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}</div>
					<div>
						<p className="font-medium">{user.name || "Unnamed User"}</p>
						<p className="text-sm text-muted-foreground">{user.email}</p>
					</div>
				</div>
				<div className="flex items-center space-x-2">
					{!canManage && <Badge variant="outline">Higher Level</Badge>}
					{user.roles?.map((role) => (
						<Badge key={role} variant="secondary">
							{role}
						</Badge>
					))}
				</div>
			</div>
		</div>
	);
}

/**
 * User details component
 */
function UserDetails({ user, onUpdate, onDelete, loading, currentUserLevel }) {
	const [editingRoles, setEditingRoles] = useState(false);
	const [newRoles, setNewRoles] = useState(user.roles || []);

	const userLevel = RoleManager.getHighestRoleLevel(user.roles || []);
	const canManage = currentUserLevel > userLevel;

	const handleSaveRoles = () => {
		onUpdate(user.id, newRoles);
		setEditingRoles(false);
	};

	const handleCancelEdit = () => {
		setNewRoles(user.roles || []);
		setEditingRoles(false);
	};

	const toggleRole = (roleName) => {
		if (!RoleManager.canAssignRole([Object.keys(ROLES)[currentUserLevel - 1]], roleName)) {
			toast.error("You cannot assign this role");
			return;
		}

		setNewRoles((prev) => {
			if (prev.includes(roleName)) {
				return prev.filter((r) => r !== roleName);
			} else {
				return [...prev, roleName];
			}
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span>User Details</span>
					{canManage && (
						<div className="flex space-x-2">
							{editingRoles ? (
								<>
									<Button size="sm" onClick={handleSaveRoles} disabled={loading}>
										<Save className="h-4 w-4" />
									</Button>
									<Button size="sm" variant="outline" onClick={handleCancelEdit}>
										<X className="h-4 w-4" />
									</Button>
								</>
							) : (
								<Button size="sm" variant="outline" onClick={() => setEditingRoles(true)}>
									<Edit className="h-4 w-4" />
								</Button>
							)}
						</div>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<label className="text-sm font-medium">Name</label>
					<p className="text-sm text-muted-foreground">{user.name || "Not set"}</p>
				</div>

				<div>
					<label className="text-sm font-medium">Email</label>
					<p className="text-sm text-muted-foreground">{user.email}</p>
				</div>

				<div>
					<label className="text-sm font-medium">Verification Status</label>
					<div className="flex space-x-2 mt-1">
						<Badge variant={user.email_verified ? "default" : "secondary"}>{user.email_verified ? "Email ✓" : "Email ✗"}</Badge>
						<Badge variant={user.phone_verified ? "default" : "secondary"}>{user.phone_verified ? "Phone ✓" : "Phone ✗"}</Badge>
					</div>
				</div>

				<div>
					<label className="text-sm font-medium">Account Status</label>
					<p className="text-sm text-muted-foreground">Created {new Date(user.created_at).toLocaleDateString()}</p>
				</div>

				<Separator />

				<div>
					<label className="text-sm font-medium">Roles</label>
					<div className="mt-2 space-y-2">
						{Object.values(ROLES).map((role) => {
							const hasRole = editingRoles ? newRoles.includes(role.name) : (user.roles || []).includes(role.name);
							const canAssign = RoleManager.canAssignRole([Object.keys(ROLES)[currentUserLevel - 1]], role.name);

							return (
								<div key={role.name} className="flex items-center justify-between p-2 border rounded">
									<div>
										<p className="font-medium">{role.displayName}</p>
										<p className="text-xs text-muted-foreground">Level {role.level}</p>
									</div>
									{editingRoles && canManage ? (
										<Button size="sm" variant={hasRole ? "default" : "outline"} onClick={() => toggleRole(role.name)} disabled={!canAssign}>
											{hasRole ? "Remove" : "Add"}
										</Button>
									) : (
										<Badge variant={hasRole ? "default" : "outline"}>{hasRole ? "Active" : "Inactive"}</Badge>
									)}
								</div>
							);
						})}
					</div>
				</div>

				{canManage && (
					<>
						<Separator />
						<div className="pt-4">
							<Button variant="destructive" size="sm" onClick={() => onDelete(user.id)} disabled={loading}>
								<Trash2 className="h-4 w-4 mr-2" />
								Delete User
							</Button>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}

/**
 * Role overview component
 */
function RoleOverview() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{Object.values(ROLES).map((role) => (
				<Card key={role.name}>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							{role.displayName}
							<Badge variant="outline">Level {role.level}</Badge>
						</CardTitle>
						<CardDescription>{role.permissions.length} permissions</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<label className="text-sm font-medium">Permissions:</label>
							<div className="max-h-40 overflow-y-auto space-y-1">
								{role.permissions.map((permission) => (
									<Badge key={permission} variant="secondary" className="text-xs mr-1 mb-1">
										{permission}
									</Badge>
								))}
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

/**
 * Permission overview component
 */
function PermissionOverview() {
	const permissionsByCategory = {};

	// Group permissions by category
	Object.values(PERMISSIONS).forEach((permission) => {
		const category = permission.split(".")[0];
		if (!permissionsByCategory[category]) {
			permissionsByCategory[category] = [];
		}
		permissionsByCategory[category].push(permission);
	});

	return (
		<div className="space-y-6">
			{Object.entries(permissionsByCategory).map(([category, permissions]) => (
				<Card key={category}>
					<CardHeader>
						<CardTitle className="capitalize">{category} Permissions</CardTitle>
						<CardDescription>{permissions.length} permissions in this category</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
							{permissions.map((permission) => (
								<Badge key={permission} variant="outline" className="justify-start">
									{permission}
								</Badge>
							))}
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
