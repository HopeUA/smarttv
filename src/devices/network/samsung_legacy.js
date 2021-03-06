define(
    'hope/devices/network/samsung_legacy',
    [
        'antie/devices/device',
        'antie/events/networkstatuschangeevent',
        'hope/devices/network/network'
    ],
    function(Device, NetworkStatusChangeEvent, Network) {
        'use strict';

        var NetworkManager = Network.extend({
            registerNetworkStatusListener: function () {
                var self = this;
                var interval = 1000;
                this.state = NetworkManager.STATE.ONLINE;

                var nextCheckConnection = function(){
                    setTimeout(checkConnection, interval);
                };
                var checkConnection = function(){
                    if (self._hasConnection()) {
                        if (self.state === NetworkManager.STATE.ONLINE) {
                            return nextCheckConnection();
                        }
                        self.emitEvent(new NetworkStatusChangeEvent(NetworkStatusChangeEvent.NETWORK_STATUS_ONLINE));
                        self.state = NetworkManager.STATE.ONLINE;
                    } else {
                        if (self.state === NetworkManager.STATE.OFFLINE) {
                            return nextCheckConnection();
                        }
                        self.emitEvent(new NetworkStatusChangeEvent(NetworkStatusChangeEvent.NETWORK_STATUS_OFFLINE));
                        self.state = NetworkManager.STATE.OFFLINE;
                    }
                    return nextCheckConnection();
                };

                nextCheckConnection();
            },

            _hasConnection: function () {
                var networkPlugin = document.getElementById('pluginObjectNetwork');
                var currentInterface = networkPlugin.GetActiveType();

                if (currentInterface === -1) {
                    return false;
                }

                var physicalConnection = networkPlugin.CheckPhysicalConnection(currentInterface);
                var httpStatus = networkPlugin.CheckHTTP(currentInterface);
                var gatewayStatus = networkPlugin.CheckGateway(currentInterface);

                if (physicalConnection !== 1) {
                    return false;
                }

                if (httpStatus !== 1) {
                    return false;
                }

                if (gatewayStatus !== 1) {
                    return false;
                }

                return true;
            },
        });

        NetworkManager.STATE = {
            ONLINE: 'NETWORK_ONLINE',
            OFFLINE: 'NETWORK_OFFLINE'
        };

        var instance = new NetworkManager();

        // Mixin this Network Manager implementation, so that device.getNetworkManager() returns the correct implementation for the device
        Device.prototype.getNetworkManager = function() {
            return instance;
        };

        return NetworkManager;
    }
);
