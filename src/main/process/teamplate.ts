export const linuxProcessLocalServerStart = `#!/bin/bash
echo "stop teamClientServer..."
$1 -cmd=stop -configDir=$2

echo "uninstall teamClientServer..."
$1 -cmd=uninstall -configDir=$2

echo "install teamClientServer..."
$1 -cmd=install -configDir=$2

if [ $? -ne 0 ]; then
    echo "本地服务安装失败"
    exit $?
fi

echo "start teamClientServer"
$1 -cmd=start -configDir=$2
if [ $? -ne 0 ];then
    echo "启动本地服务失败"
    exit $?
fi`

export const linuxProcessLocalServerStop = `#!/bin/bash
echo "stop teamClientServer..."
$1 -cmd=stop -configDir=$2

echo "uninstall teamClientServer..."
$1 -cmd=uninstall -configDir=$2`
