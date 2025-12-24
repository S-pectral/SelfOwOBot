import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Toggle } from '../components/ui/Toggle';
import { Save, User, UserPlus } from 'lucide-react';

export const Settings = () => {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // 'main' or 'extra'
    const [activeAccount, setActiveAccount] = useState<'main' | 'extra'>('main');

    const [guilds, setGuilds] = useState<any[]>([]);
    const [selectedGuild, setSelectedGuild] = useState<string>("");

    const getBaseUrl = () => {
        if (window.location.host.includes(":5173")) {
            return "http://localhost:1243";
        }
        return "";
    };

    const fetchGuilds = async () => {
        try {
            const index = activeAccount === 'main' ? 0 : 1;
            const res = await axios.get(`${getBaseUrl()}/api/guilds?index=${index}`);
            setGuilds(res.data);
            setSelectedGuild(""); // Reset selection on account switch
        } catch (err) {
            console.error("Failed to fetch guilds", err);
            setGuilds([]);
        }
    };

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const resConfig = await axios.get(`${getBaseUrl()}/api/get-config`);
                setConfig(resConfig.data);
            } catch (err) {
                console.error("Failed to load config", err);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    // Fetch guilds when account changes
    useEffect(() => {
        if (!loading) {
            fetchGuilds();
        }
    }, [activeAccount, loading]);

    // Initialize selected guild based on current config
    useEffect(() => {
        if (!loading && config && guilds.length > 0) {
            const currentConfig = config[activeAccount];
            if (currentConfig?.channelId?.[0]) {
                const currentId = currentConfig.channelId[0];
                const foundGuild = guilds.find(g => g.channels.some((c: any) => c.id === currentId));
                if (foundGuild) {
                    setSelectedGuild(foundGuild.id);
                }
            }
        }
    }, [guilds, activeAccount, loading]); // Don't run on config change to avoid loops, only initial load/account switch

    const handleSave = async () => {
        setSaving(true);
        try {
            // Send full config structure
            await axios.post(`${getBaseUrl()}/save-settings`, config);
            alert("Settings saved!");
        } catch (err) {
            console.error(err);
            alert("Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const updateConfigValue = (key: string, value: any) => {
        setConfig((prev: any) => {
            const currentAccountConfig = prev[activeAccount] || {};
            return {
                ...prev,
                [activeAccount]: { ...currentAccountConfig, [key]: value }
            };
        });
    };

    const updateChannel = (channelId: string) => {
        updateConfigValue('channelId', [channelId]);
    };

    const updateGamble = (key: string, value: any) => {
        setConfig((prev: any) => {
            const currentAccountConfig = prev[activeAccount] || {};
            const currentGamble = currentAccountConfig.autoGamble || {};
            return {
                ...prev,
                [activeAccount]: {
                    ...currentAccountConfig,
                    autoGamble: { ...currentGamble, [key]: value }
                }
            };
        });
    };




    if (loading) return <div className="p-8 text-white">Loading configuration...</div>;

    if (!config) return <div className="p-8 text-white">Error loading config.</div>;

    const activeConfig = config[activeAccount] || {};
    const activeGuild = guilds.find(g => g.id === selectedGuild);

    // If extra config is missing, initialize it empty or show specific message
    // current logic handles empty object gracefully with optional chaining

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-3xl font-bold tracking-tight text-white/90">Settings</h2>

                <Button onClick={handleSave} isLoading={saving} className="bg-green-600 hover:bg-green-700">
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
            </div>

            {/* Account Switcher - Full Width for Mobile Visibility */}
            <div className="flex bg-black/40 p-1 rounded-lg border border-white/10 w-full md:w-fit">
                <button
                    onClick={() => setActiveAccount('main')}
                    className={`flex-1 flex items-center justify-center px-6 py-3 rounded-md text-sm font-medium transition-colors ${activeAccount === 'main'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <User className="w-4 h-4 mr-2" />
                    Main Account
                </button>
                <button
                    onClick={() => setActiveAccount('extra')}
                    className={`flex-1 flex items-center justify-center px-6 py-3 rounded-md text-sm font-medium transition-colors ${activeAccount === 'extra'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Extra Account
                </button>
            </div>

            {/* Config Content */}
            <div className="grid gap-6">

                {/* Banner indicating active account */}
                <div className={`px-4 py-3 rounded-lg border flex items-center ${activeAccount === 'main'
                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-200'
                    : 'bg-purple-500/10 border-purple-500/20 text-purple-200'
                    }`}>
                    <span className="font-semibold text-sm">
                        Editing: {activeAccount === 'main' ? "Main Account" : "Extra Account"}
                    </span>
                    {activeAccount === 'extra' && !config.extra?.token && (
                        <span className="ml-2 text-xs opacity-75">(Token required in config.json first)</span>
                    )}
                </div>

                {/* Channel Selection */}
                <Card className="border-white/10 bg-black/20">
                    <CardHeader>
                        <CardTitle>Bot Channel Selection</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Server</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedGuild}
                                onChange={(e) => setSelectedGuild(e.target.value)}
                            >
                                <option value="">-- Select Server --</option>
                                {guilds.map((g: any) => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Channel</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={activeConfig.channelId?.[0] || ""}
                                onChange={(e) => updateChannel(e.target.value)}
                                disabled={!selectedGuild}
                            >
                                <option value="">-- Select Channel --</option>
                                {activeGuild?.channels.map((c: any) => (
                                    <option key={c.id} value={c.id}>#{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2 text-xs text-gray-400">
                            Current Channel ID: {activeConfig.channelId?.[0] || "None"}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Automation Toggles */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Automations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span>Auto Hunt</span>
                                <Toggle checked={activeConfig.autoHunt} onCheckedChange={(c) => updateConfigValue('autoHunt', c)} />
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Auto Battle</span>
                                <Toggle checked={activeConfig.autoBattle} onCheckedChange={(c) => updateConfigValue('autoBattle', c)} />
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Auto Daily</span>
                                <Toggle checked={activeConfig.autoDaily} onCheckedChange={(c) => updateConfigValue('autoDaily', c)} />
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Auto Lootbox</span>
                                <Toggle checked={activeConfig.autoLootbox} onCheckedChange={(c) => updateConfigValue('autoLootbox', c)} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* HuntBot Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>HuntBot</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span>Enable HuntBot</span>
                                <Toggle checked={activeConfig.autoHuntBot} onCheckedChange={(c) => updateConfigValue('autoHuntBot', c)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Auto Upgrade Trait</label>
                                <select
                                    className="flex h-9 w-full rounded-md border border-white/10 bg-black/20 px-3 py-1 text-sm shadow-sm transition-colors text-white"
                                    value={activeConfig.autoTrait || ""}
                                    onChange={(e) => updateConfigValue('autoTrait', e.target.value)}
                                >
                                    <option value="">Disabled</option>
                                    <option value="efficiency">Efficiency</option>
                                    <option value="duration">Duration</option>
                                    <option value="cost">Cost</option>
                                    <option value="gain">Gain</option>
                                    <option value="exp">Experience</option>
                                    <option value="radar">Radar</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Auto Trait Upgrade</label>
                                <select
                                    className="flex h-9 w-full rounded-md border border-white/10 bg-black/20 px-3 py-1 text-sm shadow-sm transition-colors text-white"
                                    value={activeConfig.autoTrait}
                                    onChange={(e) => updateConfigValue('autoTrait', e.target.value)}
                                >
                                    <option value="efficiency">Efficiency</option>
                                    <option value="duration">Duration</option>
                                    <option value="cost">Cost</option>
                                    <option value="gain">Gain</option>
                                    <option value="exp">Experience</option>
                                    <option value="radar">Radar</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Gem Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Gem Manager</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Auto Gem Mode</label>
                                <select
                                    className="flex h-9 w-full rounded-md border border-white/10 bg-black/20 px-3 py-1 text-sm shadow-sm transition-colors text-white"
                                    value={activeConfig.autoGem}
                                    onChange={(e) => updateConfigValue('autoGem', Number(e.target.value))}
                                >
                                    <option value="0">Off</option>
                                    <option value="1">Max Tier</option>
                                    <option value="-1">Min Tier</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Use Special Gems</span>
                                <Toggle checked={activeConfig.useSpecialGem} onCheckedChange={(c) => updateConfigValue('useSpecialGem', c)} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pray/Curse Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pray & Curse</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Command</label>
                                <select
                                    className="flex h-9 w-full rounded-md border border-white/10 bg-black/20 px-3 py-1 text-sm shadow-sm transition-colors text-white"
                                    value={activeConfig.autoPray?.[0] || ""}
                                    onChange={(e) => updateConfigValue('autoPray', [e.target.value])}
                                >
                                    <option value="">Disabled</option>
                                    <option value="pray">Pray</option>
                                    <option value="curse">Curse</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Target</label>
                                <select
                                    className="flex h-9 w-full rounded-md border border-white/10 bg-black/20 px-3 py-1 text-sm shadow-sm transition-colors text-white"
                                    value={activeConfig.prayCurseTarget || "self"}
                                    onChange={(e) => updateConfigValue('prayCurseTarget', e.target.value)}
                                >
                                    <option value="self">Self (Me)</option>
                                    <option value="other">Other User</option>
                                </select>
                            </div>

                            {activeConfig.prayCurseTarget === "other" && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Target User ID</label>
                                    <Input
                                        value={activeConfig.prayCurseTargetId || ""}
                                        onChange={(e) => updateConfigValue('prayCurseTargetId', e.target.value)}
                                        placeholder="User ID to pray/curse"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Gambling */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Gambling</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span>Auto Coinflip</span>
                                <Toggle checked={activeConfig.autoGamble?.coinflip} onCheckedChange={(c) => updateGamble('coinflip', c)} />
                            </div>
                            {activeConfig.autoGamble?.coinflip && (
                                <div className="space-y-1 ml-4 border-l-2 border-white/20 pl-4">
                                    <label className="text-xs text-gray-400">Amount</label>
                                    <Input type="number" value={activeConfig.autoGamble.coinflipAmount} onChange={(e) => updateGamble('coinflipAmount', parseInt(e.target.value) || 1)} />
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <span>Auto Slots</span>
                                <Toggle checked={activeConfig.autoGamble?.slots} onCheckedChange={(c) => updateGamble('slots', c)} />
                            </div>
                            {activeConfig.autoGamble?.slots && (
                                <div className="space-y-1 ml-4 border-l-2 border-white/20 pl-4">
                                    <label className="text-xs text-gray-400">Amount</label>
                                    <Input type="number" value={activeConfig.autoGamble.slotsAmount} onChange={(e) => updateGamble('slotsAmount', parseInt(e.target.value) || 1)} />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Inventory & Leveling */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory & Leveling</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Auto Sell */}
                            <div className="space-y-2 border-b border-white/10 pb-4">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">Auto Sell</span>
                                    <Toggle checked={activeConfig.autoSell} onCheckedChange={(c) => updateConfigValue('autoSell', c)} />
                                </div>
                                {activeConfig.autoSell && (
                                    <div className="grid grid-cols-3 gap-2 pl-2">
                                        {['common', 'uncommon', 'rare', 'epic', 'mythical', 'legendary', 'fabled'].map(rarity => (
                                            <div key={rarity} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={activeConfig.autoSellRarity?.includes(rarity) ?? ['common', 'uncommon'].includes(rarity)}
                                                    onChange={(e) => {
                                                        const current = activeConfig.autoSellRarity || ['common', 'uncommon'];
                                                        const newVal = e.target.checked
                                                            ? [...current, rarity]
                                                            : current.filter((r: string) => r !== rarity);
                                                        updateConfigValue('autoSellRarity', newVal);
                                                    }}
                                                    className="w-4 h-4 bg-black/40 border-white/20 rounded"
                                                />
                                                <span className="text-xs capitalize">{rarity}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Auto Sacrifice */}
                            <div className="space-y-2 border-b border-white/10 pb-4">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">Auto Sacrifice</span>
                                    <Toggle checked={activeConfig.autoSacrifice} onCheckedChange={(c) => updateConfigValue('autoSacrifice', c)} />
                                </div>
                                {activeConfig.autoSacrifice && (
                                    <div className="grid grid-cols-3 gap-2 pl-2">
                                        {['common', 'uncommon', 'rare', 'epic', 'mythical', 'legendary', 'fabled'].map(rarity => (
                                            <div key={rarity} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={activeConfig.autoSacrificeRarity?.includes(rarity) ?? ['common', 'uncommon'].includes(rarity)}
                                                    onChange={(e) => {
                                                        const current = activeConfig.autoSacrificeRarity || ['common', 'uncommon'];
                                                        const newVal = e.target.checked
                                                            ? [...current, rarity]
                                                            : current.filter((r: string) => r !== rarity);
                                                        updateConfigValue('autoSacrificeRarity', newVal);
                                                    }}
                                                    className="w-4 h-4 bg-black/40 border-white/20 rounded"
                                                />
                                                <span className="text-xs capitalize">{rarity}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Auto Level (Spam Quotes)</span>
                                <Toggle checked={activeConfig.autoLevel} onCheckedChange={(c) => updateConfigValue('autoLevel', c)} />
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Auto Quest</span>
                                <Toggle checked={activeConfig.autoQuest} onCheckedChange={(c) => updateConfigValue('autoQuest', c)} />
                            </div>

                        </CardContent>
                    </Card>

                    {/* Interactions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Interactions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span>Auto Cookie</span>
                                <Toggle checked={activeConfig.autoCookie} onCheckedChange={(c) => updateConfigValue('autoCookie', c)} />
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Auto Clover</span>
                                <Toggle checked={activeConfig.autoClover} onCheckedChange={(c) => updateConfigValue('autoClover', c)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Target User ID (for Cookie)</label>
                                <Input
                                    value={activeConfig.interactionTargetId || ""}
                                    onChange={(e) => updateConfigValue('interactionTargetId', e.target.value)}
                                    placeholder="User ID"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Misc Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Miscellanenous</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Webhook URL</label>
                                <Input
                                    value={activeConfig.webhookURL || ""}
                                    onChange={(e) => updateConfigValue('webhookURL', e.target.value)}
                                    placeholder="https://discord.com/api/webhooks/..."
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
