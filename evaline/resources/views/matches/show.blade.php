<x-app-layout>
    <style>
        html,
        body,
        #three-container {
            width: 100vw;
            height: 100vh;
            margin: 0;
            padding: 0;
            overflow: hidden;
        }

        #three-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 0;
        }
    </style>

    <div id="three-container"></div>

    <div id="crosshair" style="
        position: fixed;
        top: 50%;
        left: 50%;
        width: 24px;
        height: 24px;
        pointer-events: none;
        z-index: 20;
        transform: translate(-50%, -50%);
        display: flex;
        align-items: center;
        justify-content: center;
     ">
        <div style="
        width: 2px;
        height: 16px;
        background: white;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        border-radius: 1px;
    "></div>
        <div style="
        width: 16px;
        height: 2px;
        background: white;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        border-radius: 1px;
    "></div>
    </div>
</x-app-layout>